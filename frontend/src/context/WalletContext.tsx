import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

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

  // Initialize wallet on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      // Check if ethereum exists and is available
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        console.warn('No Ethereum provider found');
        return;
      }

      // Request accounts to check if already connected
      const accounts = await ethereum.request({ method: 'eth_accounts' }).catch(() => []);
      if (accounts && accounts.length > 0) {
        await setupProvider(accounts[0]);
      }

      // Listen for account changes
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.off?.('accountsChanged', handleAccountsChanged);
        ethereum.off?.('chainChanged', handleChainChanged);
      };
    } catch (err) {
      console.error('Failed to initialize wallet:', err);
    }
  };

  const setupProvider = async (selectedAccount: string) => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error('No Ethereum provider');

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(selectedAccount.toLowerCase());
      setChainId(Number(network.chainId));
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to setup provider';
      setError(errorMsg);
      console.error('Setup provider error:', err);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setupProvider(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // Reload page on chain change for simplicity
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask or other Web3 wallet not detected');
      }

      // Request accounts
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        await setupProvider(accounts[0]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Connect wallet error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  };

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
