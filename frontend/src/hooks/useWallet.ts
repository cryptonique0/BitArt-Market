import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';
import { useUserStore } from '../store';

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chain, setChain] = useState<'stacks' | 'celo'>('stacks');
  const { user, setUser } = useUserStore();

  useEffect(() => {
    // Check if user is already logged in
    (async () => {
      if (walletService.isUserLoggedIn()) {
        const currentUser = await walletService.getCurrentUser();
        if (currentUser) {
          setChain(currentUser.chain || 'stacks');
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
  }, [setUser]);

  const connect = async (selectedChain: 'stacks' | 'celo' = chain) => {
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
    } finally {
      setLoading(false);
    }
  };

  const disconnect = (selectedChain: 'stacks' | 'celo' | null = null) => {
    walletService.disconnectWallet(selectedChain);
    setUser({
      address: null,
      username: null,
      avatar: null,
      chain: null,
      balance: null,
      isConnected: false
    });
    setChain('stacks');
  };

  return {
    user,
    loading,
    error,
    chain,
    setChain,
    connect,
    disconnect,
    isConnected: user.isConnected
  };
};
