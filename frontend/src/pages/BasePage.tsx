import { ChainKitPanel } from '../components/ChainKit';
import { CHAIN_IDS } from '../utils';

const CHAIN_KITS = [
  {
    chainId: CHAIN_IDS.BASE,
    title: 'Base Network',
    badge: 'Base',
    accentGradient: 'from-blue-600 to-cyan-500',
    tokenAddress: '0x833589fCD6edB6E08f4A1D14B881671DeC0C5e62',
    tokenLabel: 'USDC (Base)',
    buyUrl: 'https://www.coinbase.com/buy',
    description: 'Low-fee L2 with strong onramp support.',
  },
  {
    chainId: CHAIN_IDS.OPTIMISM,
    title: 'Optimism',
    badge: 'OP Mainnet',
    accentGradient: 'from-red-500 to-orange-500',
    tokenAddress: '0x0B2c639c533813f4Aa9D7837CAb62653d097Ff85',
    tokenLabel: 'USDC (Optimism)',
    buyUrl: 'https://app.optimism.io/bridge',
    description: 'OP Stack toolkit with superchain access.',
  },
  {
    chainId: CHAIN_IDS.ARBITRUM,
    title: 'Arbitrum One',
    badge: 'Arbitrum',
    accentGradient: 'from-sky-500 to-indigo-500',
    tokenAddress: '0xAf88d065e77C8cC2239327C5EDb3A432268e5831',
    tokenLabel: 'USDC (Arbitrum)',
    buyUrl: 'https://bridge.arbitrum.io',
    description: 'Nitro rollup with deep liquidity.',
  },
  {
    chainId: CHAIN_IDS.POLYGON,
    title: 'Polygon PoS',
    badge: 'Polygon',
    accentGradient: 'from-purple-500 to-pink-500',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    tokenLabel: 'USDC (Polygon)',
    buyUrl: 'https://wallet.polygon.technology/polygon/bridge',
    description: 'EVM network with fast finality and wide dapp coverage.',
  },
  {
    chainId: CHAIN_IDS.BSC,
    title: 'BNB Smart Chain',
    badge: 'BSC',
    accentGradient: 'from-amber-500 to-yellow-500',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955',
    tokenLabel: 'USDT (BSC)',
    buyUrl: 'https://www.binance.com/en/fiat/crypto',
    description: 'High-throughput chain with low fees.',
  },
  {
    chainId: CHAIN_IDS.AVALANCHE,
    title: 'Avalanche C-Chain',
    badge: 'Avalanche',
    accentGradient: 'from-rose-500 to-red-500',
    tokenAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    tokenLabel: 'USDC (Avalanche)',
    buyUrl: 'https://bridge.avax.network',
    description: 'Subnet-ready L1 with fast finality.',
  },
];

export default function BasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Multi-chain EVM
              </p>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Network Toolkits
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-200 rounded-full border border-indigo-200 dark:border-indigo-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>6
                Networks
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
            Connect, switch, and manage your assets across multiple EVM-compatible networks with
            real-time balances and one-click chain switching.
          </p>
        </div>

        {/* Toolkits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CHAIN_KITS.map(kit => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
