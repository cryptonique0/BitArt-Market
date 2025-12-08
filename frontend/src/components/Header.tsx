import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  const { user, connect, disconnect, isConnected, chain, setChain } = useWallet();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BA</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">
              BitArt Market
            </span>
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

            {/* Chain selector */}
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value as 'stacks' | 'celo')}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="stacks">Stacks</option>
              <option value="celo">Celo</option>
            </select>

            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {user.chain === 'stacks' ? 'Stacks' : 'Celo'}
                </div>
                <Link
                  to={`/profile/${user.address}`}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold"
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
                onClick={() => connect(chain)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Connect {chain === 'stacks' ? 'Stacks' : 'Celo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
