import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';
import { useUserStore } from '../store';

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chain, setChain] = useState<'stacks' | 'base'>('base'); // Default to Base for contest
  const { user, setUser } = useUserStore();

  useEffect(() => {
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
    const unsubscribe = walletService.onChainChange((newChain) => {
      setChain(newChain);
    });

    return unsubscribe;
  }, [setUser]);

  const connect = async (selectedChain: 'stacks' | 'base' = chain) => {
    setLoading(true);
    setError(null);
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
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setChain(chain); // Revert chain on error
    } finally {
      setLoading(false);
    }
  };

  const disconnect = (selectedChain: 'stacks' | 'base' | null = null) => {
    walletService.disconnectWallet(selectedChain);
    setUser({
      address: null,
      username: null,
      avatar: null,
      chain: null,
      balance: null,
      isConnected: false
    });
    setChain('base');
  };

  const autoSwitchToBase = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await walletService.autoDetectAndSwitchToBase();
      if (success) {
        setChain('base');
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
    chain,
    setChain,
    connect,
    disconnect,
    isConnected: user.isConnected,
    autoSwitchToBase
  };
};
