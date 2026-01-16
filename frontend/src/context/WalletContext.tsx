import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWindowEthereum = () => (window as any).ethereum;

interface EthereumProvider {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  off?: (event: string, callback: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe provider detection for multi-wallet environments
  const getEthereumProvider = useCallback((): EthereumProvider | null => {
    try {
      const providers = getWindowEthereum();

      if (!providers) return null;

      // If single provider with request method, use it directly
      if (typeof (providers as Record<string, unknown>).request === 'function') {
        return providers as EthereumProvider;
      }

      // If array of providers, prefer MetaMask, fallback to first
      if (Array.isArray(providers)) {
        const metamask = providers.find((p: unknown) => (p as Record<string, unknown>).isMetaMask);
        return (metamask || providers[0]) as EthereumProvider;
      }

      // If object with providers property
      if (
        (providers as Record<string, unknown>).providers &&
        Array.isArray((providers as Record<string, unknown>).providers)
      ) {
        const providersList = (providers as Record<string, unknown>).providers as unknown[];
        const metamask = providersList.find(
          (p: unknown) => (p as Record<string, unknown>).isMetaMask
        );
        return (metamask || providersList[0]) as EthereumProvider;
      }

      return providers as EthereumProvider;
    } catch (err) {
      console.error('Error getting ethereum provider:', err);
      return null;
    }
  }, []);

  const setupProvider = useCallback(
    async (selectedAccount: string) => {
      try {
        const ethereum = getEthereumProvider();
        if (!ethereum || !ethereum.request) throw new Error('No Ethereum provider');

        // Type cast is safe because we checked for request method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ethProvider = new ethers.BrowserProvider(ethereum as any);
        const signer = await ethProvider.getSigner();
        const network = await ethProvider.getNetwork();

        setProvider(ethProvider);
        setSigner(signer);
        setAccount(selectedAccount.toLowerCase());
        setChainId(Number(network.chainId));
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to setup provider';
        setError(errorMsg);
        console.error('Setup provider error:', err);
      }
    },
    [getEthereumProvider]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAccountsChanged = useCallback(
    (accounts: any) => {
      const accountList = Array.isArray(accounts) ? (accounts as string[]) : [];
      if (accountList.length === 0) {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setError(null);
      } else {
        setupProvider(accountList[0]);
      }
    },
    [setupProvider]
  );

  const handleChainChanged = useCallback(() => {
    // Reload page on chain change for simplicity
    window.location.reload();
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const ethereum = getEthereumProvider();
      if (!ethereum || !ethereum.request) {
        throw new Error('MetaMask or other Web3 wallet not detected');
      }

      // Request accounts
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const accountList = Array.isArray(accounts) ? (accounts as string[]) : [];
      if (accountList && accountList.length > 0) {
        await setupProvider(accountList[0]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Connect wallet error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [getEthereumProvider, setupProvider]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // Initialize wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const ethereum = getEthereumProvider();
        if (!ethereum) {
          console.warn('No Ethereum provider found');
          return;
        }

        // Request accounts to check if already connected
        try {
          const accounts = await ethereum.request?.({ method: 'eth_accounts' });
          const accountList = Array.isArray(accounts) ? (accounts as string[]) : [];
          if (accountList && accountList.length > 0) {
            await setupProvider(accountList[0]);
          }
        } catch (err) {
          console.warn('Could not get accounts:', err);
        }

        // Listen for account changes safely
        if (ethereum.on && typeof ethereum.on === 'function') {
          ethereum.on('accountsChanged', handleAccountsChanged);
          ethereum.on('chainChanged', handleChainChanged);
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      }
    };

    initializeWallet();

    // Cleanup
    return () => {
      const ethereum = getEthereumProvider();
      if (ethereum && ethereum.off && typeof ethereum.off === 'function') {
        ethereum.off('accountsChanged', handleAccountsChanged);
        ethereum.off('chainChanged', handleChainChanged);
      }
    };
  }, [getEthereumProvider, handleAccountsChanged, handleChainChanged, setupProvider]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
