import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';
import { useUserStore } from '../store';

const SESSION_STORAGE_KEY = 'bitart_wallet_session';

interface SessionData {
  address: string;
  chain: 'stacks' | 'base';
  timestamp: number;
}

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chain, setChain] = useState<'stacks' | 'base'>('base'); // Default to Base for contest
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const { user, setUser } = useUserStore();

  /**
   * Restore session from localStorage if valid
   */
  const restoreSession = async () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionStr) return;

      const session: SessionData = JSON.parse(sessionStr);
      
      // Check if session is less than 7 days old
      const sessionAge = Date.now() - session.timestamp;
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      
      if (sessionAge > SEVEN_DAYS) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }

      // Try to reconnect with saved address and chain
      const currentUser = await walletService.getCurrentUser(session.chain);
      if (currentUser && currentUser.address === session.address) {
        setChain(session.chain);
        setUser({
          address: currentUser.address || null,
          username: currentUser.username || null,
          avatar: null,
          chain: session.chain,
          balance: currentUser.balance || null,
          isConnected: true
        });
      }
    } catch (err) {
      // Session restore failed, clear it
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  /**
   * Save session to localStorage
   */
  const saveSession = (address: string, selectedChain: 'stacks' | 'base') => {
    const session: SessionData = {
      address,
      chain: selectedChain,
      timestamp: Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  /**
   * Clear session from localStorage
   */
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  useEffect(() => {
    // Restore session on component mount
    restoreSession();

    // Check if user is already logged in and detect current chain
    (async () => {
      // Try to detect current chain for Base wallet users
      const detectedChain = await walletService.getCurrentChain();
      
      if (walletService.isUserLoggedIn()) {
        const currentUser = await walletService.getCurrentUser();
        if (currentUser) {
          setChain(currentUser.chain || (detectedChain || 'base'));
          setUser({
            address: currentUser.address || null,
            username: currentUser.username || null,
            avatar: null,
            chain: currentUser.chain,
            balance: currentUser.balance || null,
            isConnected: true
          });
        }
      }
    })();

    // Listen for chain changes in wallet
    const unsubscribeChain = walletService.onChainChange((newChain) => {
      setChain(newChain);
    });

    // Listen for account changes
    const unsubscribeAccount = walletService.onAccountChange((newAddress) => {
      if (!newAddress) {
        // Account disconnected
        disconnect();
      } else {
        // Account changed, update user
        const currentChain = walletService.getCurrentChain() || 'base';
        setUser({
          address: newAddress,
          username: user?.username || null,
          avatar: user?.avatar || null,
          chain: currentChain,
          balance: user?.balance || null,
          isConnected: true
        });
        saveSession(newAddress, currentChain);
      }
    });

    // Listen for wallet disconnect
    const unsubscribeDisconnect = walletService.onDisconnect(() => {
      disconnect();
      setDisconnectError('Wallet disconnected. Please reconnect.');
    });

    return () => {
      unsubscribeChain?.();
      unsubscribeAccount?.();
      unsubscribeDisconnect?.();
    };
  }, [setUser]);

  const connect = async (selectedChain: 'stacks' | 'base' = chain) => {
    setLoading(true);
    setError(null);
    setDisconnectError(null);
    try {
      setChain(selectedChain);
      const connection = await walletService.connectWallet(selectedChain);
      if (connection) {
        const currentUser = await walletService.getCurrentUser(selectedChain);
        if (currentUser) {
          setUser({
            address: currentUser.address || null,
            username: currentUser.username || null,
            avatar: null,
            chain: currentUser.chain,
            balance: currentUser.balance || null,
            isConnected: true
          });
          
          // Save session for persistence
          if (currentUser.address) {
            saveSession(currentUser.address, selectedChain);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      clearSession();
      setChain(chain); // Revert chain on error
    } finally {
      setLoading(false);
    }
  };

  const disconnect = (selectedChain: 'stacks' | 'base' | null = null) => {
    try {
      walletService.disconnectWallet(selectedChain);
      clearSession();
      setUser({
        address: null,
        username: null,
        avatar: null,
        chain: null,
        balance: null,
        isConnected: false
      });
      setChain('base');
    } catch (err: any) {
      setDisconnectError(err.message || 'Failed to disconnect wallet');
    }
  };

  const autoSwitchToBase = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await walletService.autoDetectAndSwitchToBase();
      if (success) {
        setChain('base');
        if (user?.address) {
          saveSession(user.address, 'base');
        }
      } else {
        setError('Failed to switch to Base network');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    disconnectError,
    clearDisconnectError: () => setDisconnectError(null),
    chain,
    setChain,
    connect,
    disconnect,
    isConnected: user.isConnected,
    autoSwitchToBase
  };
};
