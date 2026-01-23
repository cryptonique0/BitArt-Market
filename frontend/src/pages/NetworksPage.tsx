import { ChainKitPanel } from '../components/ChainKit';
import { CHAIN_IDS } from '../utils';
import { useState } from 'react';

// Mainnet configurations
const MAINNET_KITS = [
  {
    chainId: CHAIN_IDS.BASE,
    title: 'Base Network',
    badge: 'Base',
    accentGradient: 'from-blue-600 to-cyan-500',
    tokenAddress: '0x833589fCD6edB6E08f4A1D14B881671DeC0C5e62' as `0x${string}`,
    tokenLabel: 'USDC (Base)',
    buyUrl: 'https://www.coinbase.com/buy',
    description: 'Low-fee L2 with strong onramp support.',
  },
  {
    chainId: CHAIN_IDS.OPTIMISM,
    title: 'Optimism',
    badge: 'OP Mainnet',
    accentGradient: 'from-red-500 to-orange-500',
    tokenAddress: '0x0B2c639c533813f4Aa9D7837CAb62653d097Ff85' as `0x${string}`,
    tokenLabel: 'USDC (Optimism)',
    buyUrl: 'https://app.optimism.io/bridge',
    description: 'OP Stack toolkit with superchain access.',
  },
  {
    chainId: CHAIN_IDS.ARBITRUM,
    title: 'Arbitrum One',
    badge: 'Arbitrum',
    accentGradient: 'from-sky-500 to-indigo-500',
    tokenAddress: '0xAf88d065e77C8cC2239327C5EDb3A432268e5831' as `0x${string}`,
    tokenLabel: 'USDC (Arbitrum)',
    buyUrl: 'https://bridge.arbitrum.io',
    description: 'Nitro rollup with deep liquidity.',
  },
  {
    chainId: CHAIN_IDS.POLYGON,
    title: 'Polygon PoS',
    badge: 'Polygon',
    accentGradient: 'from-purple-500 to-pink-500',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as `0x${string}`,
    tokenLabel: 'USDC (Polygon)',
    buyUrl: 'https://wallet.polygon.technology/polygon/bridge',
    description: 'EVM network with fast finality and wide dapp coverage.',
  },
  {
    chainId: CHAIN_IDS.BSC,
    title: 'BNB Smart Chain',
    badge: 'BSC',
    accentGradient: 'from-amber-500 to-yellow-500',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    tokenLabel: 'USDT (BSC)',
    buyUrl: 'https://www.binance.com/en/fiat/crypto',
    description: 'High-throughput chain with low fees.',
  },
  {
    chainId: CHAIN_IDS.AVALANCHE,
    title: 'Avalanche C-Chain',
    badge: 'Avalanche',
    accentGradient: 'from-rose-500 to-red-500',
    tokenAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' as `0x${string}`,
    tokenLabel: 'USDC (Avalanche)',
    buyUrl: 'https://bridge.avax.network',
    description: 'Subnet-ready L1 with fast finality.',
  },
];

// Testnet configurations
const TESTNET_KITS = [
  {
    chainId: CHAIN_IDS.SEPOLIA,
    title: 'Ethereum Sepolia',
    badge: 'Sepolia',
    accentGradient: 'from-gray-600 to-gray-500',
    tokenLabel: 'Test ETH',
    buyUrl: 'https://sepoliafaucet.com',
    description: 'Ethereum testnet for development and testing.',
  },
  {
    chainId: CHAIN_IDS.BASE_SEPOLIA,
    title: 'Base Sepolia',
    badge: 'Base Testnet',
    accentGradient: 'from-blue-400 to-cyan-400',
    tokenLabel: 'Test ETH',
    buyUrl: 'https://www.coinbase.com/faucets/base-ethereum-goerli-faucet',
    description: 'Base testnet for L2 development.',
  },
];

export default function NetworksPage() {
  const [showTestnets, setShowTestnets] = useState(false);
  const activeKits = showTestnets ? TESTNET_KITS : MAINNET_KITS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Animated Background Gradient */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/20 via-purple-200/20 to-pink-200/20 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                  Multi-chain EVM
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Network Toolkits
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Testnet Toggle */}
              <button
                onClick={() => setShowTestnets(!showTestnets)}
                className={`group inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  showTestnets
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50 dark:shadow-orange-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                {showTestnets ? 'Testnets' : 'Mainnets'}
              </button>

              {/* Network Count Badge */}
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-200 rounded-full border border-indigo-200 dark:border-indigo-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {activeKits.length} {showTestnets ? 'Testnets' : 'Networks'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
            {showTestnets
              ? 'Development and testing environments with free test tokens from faucets.'
              : 'Connect, switch, and manage your assets across multiple EVM-compatible networks with real-time balances and one-click chain switching.'}
          </p>
        </div>

        {/* Toolkits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeKits.map(kit => (
            <ChainKitPanel key={kit.chainId} {...kit} />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-500">●</span> Real-time balances
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-500">●</span> One-click switching
            </span>
            <span className="flex items-center gap-1">
              <span className="text-purple-500">●</span> Multi-wallet support
            </span>
            <span className="flex items-center gap-1">
              <span className="text-orange-500">●</span> Direct bridge access
            </span>
            {showTestnets && (
              <span className="flex items-center gap-1">
                <span className="text-amber-500">●</span> Free faucet tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
