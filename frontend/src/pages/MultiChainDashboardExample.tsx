/**
 * Complete Multi-Chain Toolkit Example Page
 * Demonstrates all components and services
 */

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  NetworkStatsPanel,
  MultiChainBalance,
  BridgeIntegration,
  TransactionMonitor,
  NetworkSelectorModal,
} from '../components/ChainKit';
import { CHAIN_IDS } from '../utils/rainbowkit';

export default function MultiChainDashboardExample() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'overview' | 'bridge' | 'monitor' | 'stats'>(
    'overview'
  );
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [selectedFromChain, setSelectedFromChain] = useState(8453);
  const [selectedToChain, setSelectedToChain] = useState(10);

  // Mock balances across chains
  const [userBalances] = useState([
    {
      chainId: 1,
      chainName: 'Ethereum',
      nativeBalance: 0.5,
      tokens: [
        { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', amount: 1000 },
        { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', amount: 500 },
      ],
    },
    {
      chainId: 8453,
      chainName: 'Base',
      nativeBalance: 2.5,
      tokens: [
        { symbol: 'USDC', address: '0x833589fcd6edb6e08f4c7c32d4f71b3228cdcd73', amount: 2000 },
      ],
    },
    {
      chainId: 10,
      chainName: 'Optimism',
      nativeBalance: 1.2,
      tokens: [
        { symbol: 'USDC', address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', amount: 1500 },
      ],
    },
    {
      chainId: 42161,
      chainName: 'Arbitrum',
      nativeBalance: 0.8,
      tokens: [
        { symbol: 'USDC', address: '0xff970a61a04b1ca14834a43f5de4533ebddb5f86', amount: 800 },
      ],
    },
  ]);

  const supportedChainIds = Object.values(CHAIN_IDS);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'bridge', label: '🌉 Bridge', icon: '🌉' },
    { id: 'monitor', label: '📜 Transactions', icon: '📜' },
    { id: 'stats', label: '⚙️ Network Stats', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-indigo-900/10 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white shadow-xl">
          <h1 className="text-4xl md:text-5xl font-black mb-2">Multi-Chain Dashboard</h1>
          <p className="text-indigo-100 text-lg">
            Manage your portfolio across 9 EVM networks with optimized gas and real-time monitoring
          </p>
          {address && (
            <p className="text-indigo-200 text-sm mt-4">
              Connected:
              {address.slice(0, 6)}
              ...
              {address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition transform ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                Portfolio Overview
              </h2>

              {!address ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect your wallet to see your portfolio
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported chains: Ethereum, Base, Optimism, Arbitrum, Polygon, BSC, Avalanche,
                    and testnets
                  </p>
                </div>
              ) : (
                <MultiChainBalance balances={userBalances} />
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-4">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Base has the cheapest gas for NFT operations</li>
                  <li>✓ Optimism offers fastest transaction finality</li>
                  <li>✓ Use Bridge to move assets between chains</li>
                  <li>✓ Monitor gas prices before swapping</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-4">🚀 Supported Networks</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Mainnet (6):</div>
                  <div>Testnet (2):</div>
                  <div className="text-xs opacity-90">
                    Ethereum, Base, Optimism, Arbitrum, Polygon, BSC, Avalanche
                  </div>
                  <div className="text-xs opacity-90">Sepolia, Base Sepolia</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Tab */}
        {activeTab === 'bridge' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                Cross-Chain Bridge
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chain Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      From Chain
                    </label>
                    <button
                      onClick={() => setShowNetworkSelector(true)}
                      className="w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      {selectedFromChain === 1
                        ? 'Ethereum'
                        : selectedFromChain === 8453
                          ? 'Base'
                          : selectedFromChain === 10
                            ? 'Optimism'
                            : 'Arbitrum'}
                    </button>
                  </div>

                  <div className="flex justify-center py-2">
                    <button
                      onClick={() => {
                        [setSelectedFromChain, setSelectedToChain] = [
                          setSelectedToChain,
                          setSelectedFromChain,
                        ];
                      }}
                      className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition"
                    >
                      ↔️
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      To Chain
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-gray-900 dark:text-white">
                      {selectedToChain === 1
                        ? 'Ethereum'
                        : selectedToChain === 8453
                          ? 'Base'
                          : selectedToChain === 10
                            ? 'Optimism'
                            : 'Arbitrum'}
                    </div>
                  </div>
                </div>

                {/* Bridge Options */}
                <div className="lg:col-span-2">
                  <BridgeIntegration
                    fromChainId={selectedFromChain}
                    toChainId={selectedToChain}
                    tokenAddress="0x0000000000000000000000000000000000000000"
                    amount="1"
                    onBridgeSelected={route => console.log('Selected bridge:', route)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitor Tab */}
        {activeTab === 'monitor' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Transaction Monitor
            </h2>

            {!address ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Connect your wallet to view transactions
              </div>
            ) : (
              <TransactionMonitor userAddress={address} chainIds={supportedChainIds} limit={20} />
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                  Network Statistics
                </h2>
                <NetworkStatsPanel />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                  Help & Resources
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      📖 Documentation
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      See MULTI_CHAIN_TOOLKIT_GUIDE.md
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                      ✅ All Features Included
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      Gas optimizer, Price feeds, Bridges, Transactions, Stats
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                      🔌 Easy Integration
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                      Import components from ChainKit barrel export
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Selector Modal */}
      <NetworkSelectorModal
        isOpen={showNetworkSelector}
        currentChainId={selectedFromChain}
        availableChainIds={[1, 8453, 10, 42161, 137, 56, 43114]}
        operationType="nft"
        onSelectChain={setSelectedFromChain}
        onClose={() => setShowNetworkSelector(false)}
      />
    </div>
  );
}
