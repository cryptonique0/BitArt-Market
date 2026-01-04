import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { ThemeToggle } from './ThemeToggle';
import { BaseNativeBadge } from './Badge';

export const Header: React.FC = () => {
  const { user, connect, disconnect, isConnected, chain, autoSwitchToBase, error, loading } = useWallet();
  const [showChainWarning, setShowChainWarning] = useState(false);

  // Show warning if not on Base when connected
  useEffect(() => {
    if (isConnected && chain !== 'base') {
      setShowChainWarning(true);
    } else {
      setShowChainWarning(false);
    }
  }, [isConnected, chain]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      {/* Chain Warning Banner */}
      {showChainWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ You're not on Base. BitArt Market is optimized for Base Mainnet.
            </span>
            <button
              onClick={autoSwitchToBase}
              disabled={loading}
              className="ml-4 px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded transition-colors"
            >
              {loading ? 'Switching...' : 'Switch to Base'}
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BA</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">
                BitArt Market
              </span>
              <BaseNativeBadge className="hidden sm:inline-flex" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link
              to="/discover"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Discover
            </Link>
            <Link
              to="/create"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link
              to="/studio"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Studio
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Base Badge */}
                <BaseNativeBadge />
                <Link
                  to={`/profile/${user.address}`}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold hover:shadow-lg transition-shadow"
                  title={user.address || ''}
                >
                  {user.address?.substring(0, 2).toUpperCase()}
                </Link>
                <button
                  onClick={() => disconnect(user.chain || null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect('base')}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
