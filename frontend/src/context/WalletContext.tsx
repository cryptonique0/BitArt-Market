import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { walletConnector } from '../services/multi-wallet-connector';
import { WalletType, WalletInfo } from '../types/wallet';

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  walletType: WalletType | null;
  isConnecting: boolean;
  error: string | null;
  availableWallets: WalletInfo[];
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  // Initialize available wallets
  useEffect(() => {
    const wallets = walletConnector.getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setWalletType(null);
      setError(null);
    } else {
      setAccount(accounts[0].toLowerCase());
    }
  }, []);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  const connectWallet = useCallback(async (selectedWalletType?: WalletType) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Default to MetaMask if no wallet type specified
      const typeToConnect = selectedWalletType || WalletType.METAMASK;

      const connection = await walletConnector.connect(typeToConnect, {
        onConnecting: () => setIsConnecting(true),
        onError: err => setError(err.message),
      });

      setProvider(connection.provider);
      setSigner(connection.signer);
      setAccount(connection.account);
      setChainId(connection.chainId);
      setWalletType(connection.walletType);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Connect wallet error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    await walletConnector.disconnect();
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletType(null);
    setError(null);
  }, []);

  const switchChain = useCallback(async (newChainId: number) => {
    try {
      await walletConnector.switchChain(newChainId);
      setChainId(newChainId);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch chain';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Initialize wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const connection = walletConnector.getConnection();
        if (connection) {
          setProvider(connection.provider);
          setSigner(connection.signer);
          setAccount(connection.account);
          setChainId(connection.chainId);
          setWalletType(connection.walletType);
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      }
    };

    initializeWallet();

    // Setup event listeners
    walletConnector.on('accountsChanged', handleAccountsChanged);
    walletConnector.on('chainChanged', handleChainChanged);

    return () => {
      walletConnector.off('accountsChanged', handleAccountsChanged);
      walletConnector.off('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        walletType,
        isConnecting,
        error,
        availableWallets,
        connectWallet,
        disconnectWallet,
        switchChain,
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
