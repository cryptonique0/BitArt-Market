import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

/**
 * Hook to sync RainbowKit (wagmi) state with our custom WalletContext
 * This allows us to use RainbowKit UI while maintaining compatibility with existing code
 */
export const useRainbowKitSync = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectWallet } = useWallet();

  // Sync RainbowKit connection state with WalletContext
  useEffect(() => {
    if (isConnected && address) {
      // When RainbowKit connects, update our context
      // Note: WalletContext already handles provider/signer setup
      console.log('RainbowKit connected:', address, 'Chain:', chain?.id);
    }
  }, [isConnected, address, chain]);

  return {
    address,
    isConnected,
    chain,
    disconnect,
    connect: connectWallet,
  };
};
