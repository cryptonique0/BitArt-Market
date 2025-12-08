import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';
import { useUserStore } from '../store';

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useUserStore();

  useEffect(() => {
    // Check if user is already logged in
    if (walletService.isUserLoggedIn()) {
      const currentUser = walletService.getCurrentUser();
      if (currentUser) {
        setUser({
          address: currentUser.address,
          username: currentUser.username,
          avatar: null,
          isConnected: true
        });
      }
    }
  }, [setUser]);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await walletService.connectWallet();
      if (address) {
        const currentUser = walletService.getCurrentUser();
        if (currentUser) {
          setUser({
            address: currentUser.address,
            username: currentUser.username,
            avatar: null,
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

  const disconnect = () => {
    walletService.disconnectWallet();
    setUser({
      address: null,
      username: null,
      avatar: null,
      isConnected: false
    });
  };

  return {
    user,
    loading,
    error,
    connect,
    disconnect,
    isConnected: user.isConnected
  };
};
