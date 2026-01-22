import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletType, WalletInfo } from '../types/wallet';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { availableWallets, connectWallet, isConnecting, error } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletType: WalletType, wallet: WalletInfo) => {
    if (!wallet.isInstalled && wallet.downloadUrl) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setSelectedWallet(walletType);
    try {
      await connectWallet(walletType);
      onClose();
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setSelectedWallet(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Wallet List */}
        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.type}
              onClick={() => handleWalletSelect(wallet.type, wallet)}
              disabled={isConnecting && selectedWallet === wallet.type}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                ${
                  wallet.isInstalled
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }
                ${
                  isConnecting && selectedWallet === wallet.type
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{wallet.icon}</div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {wallet.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {wallet.isInstalled ? wallet.description : 'Not installed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {isConnecting && selectedWallet === wallet.type ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : wallet.isInstalled ? (
                  <svg
                    className="w-6 h-6 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                ) : (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Install
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            New to Ethereum wallets?{' '}
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletSelectionModal;
