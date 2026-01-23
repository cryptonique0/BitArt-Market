/**
 * Network Statistics Service
 * Provides real-time data on network health, gas prices, TVL, and chain metrics
 */

export interface NetworkStats {
  chainId: number;
  chainName: string;
  gasPrice: {
    standard: number;
    fast: number;
    instant: number;
    gwei: string;
  };
  blockTime: number;
  txCost: {
    simple: number;
    nft: number;
    swap: number;
  };
  tvl: string;
  dailyVolume: string;
  activeUsers: number;
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    avgLatency: number;
  };
}

export interface ChainComparison {
  chainId: number;
  gasCost: number;
  speed: number;
  security: number;
  tvl: string;
  recommendation: string;
}

// Mock data for development - replace with real API calls
const MOCK_STATS: Record<number, NetworkStats> = {
  1: {
    chainId: 1,
    chainName: 'Ethereum',
    gasPrice: { standard: 45, fast: 52, instant: 65, gwei: '45.2' },
    blockTime: 12,
    txCost: { simple: 0.015, nft: 0.08, swap: 0.12 },
    tvl: '$35.2B',
    dailyVolume: '$15.8B',
    activeUsers: 245000,
    health: { status: 'healthy', uptime: 99.97, avgLatency: 280 },
  },
  8453: {
    chainId: 8453,
    chainName: 'Base',
    gasPrice: { standard: 0.5, fast: 0.8, instant: 1.2, gwei: '0.5' },
    blockTime: 2,
    txCost: { simple: 0.0001, nft: 0.0005, swap: 0.001 },
    tvl: '$3.2B',
    dailyVolume: '520M',
    activeUsers: 85000,
    health: { status: 'healthy', uptime: 99.95, avgLatency: 120 },
  },
  10: {
    chainId: 10,
    chainName: 'Optimism',
    gasPrice: { standard: 0.25, fast: 0.4, instant: 0.6, gwei: '0.25' },
    blockTime: 2,
    txCost: { simple: 0.00008, nft: 0.0004, swap: 0.0008 },
    tvl: '$2.8B',
    dailyVolume: '380M',
    activeUsers: 72000,
    health: { status: 'healthy', uptime: 99.93, avgLatency: 110 },
  },
  42161: {
    chainId: 42161,
    chainName: 'Arbitrum',
    gasPrice: { standard: 0.3, fast: 0.5, instant: 0.8, gwei: '0.3' },
    blockTime: 0.25,
    txCost: { simple: 0.0001, nft: 0.0006, swap: 0.0012 },
    tvl: '4.1B',
    dailyVolume: '620M',
    activeUsers: 95000,
    health: { status: 'healthy', uptime: 99.94, avgLatency: 130 },
  },
  137: {
    chainId: 137,
    chainName: 'Polygon',
    gasPrice: { standard: 0.02, fast: 0.04, instant: 0.08, gwei: '0.02' },
    blockTime: 2,
    txCost: { simple: 0.000008, nft: 0.00004, swap: 0.00008 },
    tvl: '1.9B',
    dailyVolume: '280M',
    activeUsers: 68000,
    health: { status: 'healthy', uptime: 99.92, avgLatency: 140 },
  },
  56: {
    chainId: 56,
    chainName: 'BSC',
    gasPrice: { standard: 1, fast: 1.5, instant: 2, gwei: '1.0' },
    blockTime: 3,
    txCost: { simple: 0.0003, nft: 0.0015, swap: 0.003 },
    tvl: '2.5B',
    dailyVolume: '420M',
    activeUsers: 78000,
    health: { status: 'healthy', uptime: 99.91, avgLatency: 160 },
  },
  43114: {
    chainId: 43114,
    chainName: 'Avalanche',
    gasPrice: { standard: 0.5, fast: 0.8, instant: 1.2, gwei: '0.5' },
    blockTime: 1,
    txCost: { simple: 0.0002, nft: 0.001, swap: 0.002 },
    tvl: '1.2B',
    dailyVolume: '180M',
    activeUsers: 48000,
    health: { status: 'healthy', uptime: 99.9, avgLatency: 150 },
  },
};

/**
 * Get network statistics for a specific chain
 */
export async function getNetworkStats(chainId: number): Promise<NetworkStats | null> {
  try {
    // In production, fetch from Moralis, CoinGecko, Dune Analytics, or custom API
    return MOCK_STATS[chainId] || null;
  } catch (error) {
    console.error(`Failed to fetch stats for chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Get stats for all configured chains
 */
export async function getAllNetworkStats(chainIds: number[]): Promise<NetworkStats[]> {
  try {
    const stats = await Promise.all(chainIds.map(id => getNetworkStats(id)));
    return stats.filter((stat): stat is NetworkStats => stat !== null);
  } catch (error) {
    console.error('Failed to fetch all network stats:', error);
    return [];
  }
}

/**
 * Compare chains and find cheapest for specific operation
 */
export function findCheapestChain(
  stats: NetworkStats[],
  operationType: 'simple' | 'nft' | 'swap' = 'nft'
): { chain: NetworkStats; savings: number } | null {
  if (stats.length === 0) return null;

  let cheapest = stats[0];
  let lowestCost = stats[0].txCost[operationType];

  for (const stat of stats.slice(1)) {
    if (stat.txCost[operationType] < lowestCost) {
      cheapest = stat;
      lowestCost = stat.txCost[operationType];
    }
  }

  const mostExpensive = Math.max(...stats.map(s => s.txCost[operationType]));
  const savings = mostExpensive - lowestCost;

  return { chain: cheapest, savings };
}

/**
 * Get recommendation for best chain based on criteria
 */
export function getChainRecommendation(
  stats: NetworkStats[],
  criteria: {
    priority: 'cheapest' | 'fastest' | 'balanced' | 'secure';
    operationType?: 'simple' | 'nft' | 'swap';
  }
): NetworkStats | null {
  if (stats.length === 0) return null;

  if (criteria.priority === 'cheapest') {
    const cheapest = findCheapestChain(stats, criteria.operationType || 'nft');
    return cheapest?.chain || null;
  }

  if (criteria.priority === 'fastest') {
    // Sort by block time and gas finality
    const sorted = [...stats].sort((a, b) => a.blockTime - b.blockTime);
    return sorted[0];
  }

  if (criteria.priority === 'balanced') {
    // Balance between cost and speed
    const scored = stats.map(stat => ({
      chain: stat,
      score:
        stat.blockTime * 0.3 + // 30% weight on speed
        stat.txCost.nft * 100 * 0.5 + // 50% weight on cost
        (stat.health.uptime / 100) * 20, // 20% weight on uptime
    }));
    scored.sort((a, b) => a.score - b.score);
    return scored[0].chain;
  }

  // 'secure' - prioritize mainnet and established chains
  const securityScores: Record<number, number> = {
    1: 100, // Ethereum
    8453: 90, // Base
    42161: 85, // Arbitrum
    10: 85, // Optimism
    137: 80, // Polygon
    56: 75, // BSC
    43114: 70, // Avalanche
  };

  const secured = [...stats].sort(
    (a, b) => (securityScores[b.chainId] || 0) - (securityScores[a.chainId] || 0)
  );

  return secured[0];
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gwei: number): string {
  if (gwei < 1) return `${(gwei * 1000).toFixed(2)} mwei`;
  if (gwei < 1000) return `${gwei.toFixed(2)} Gwei`;
  return `${(gwei / 1000).toFixed(2)} mwei`;
}

/**
 * Calculate transaction cost in USD
 */
export async function calculateTxCostUSD(
  chainId: number,
  operationType: 'simple' | 'nft' | 'swap',
  ethPriceUSD: number = 2500
): Promise<number> {
  const stats = await getNetworkStats(chainId);
  if (!stats) return 0;

  const txCostEth = stats.txCost[operationType];
  return txCostEth * ethPriceUSD;
}

/**
 * Get health status color for UI
 */
export function getHealthStatusColor(status: 'healthy' | 'degraded' | 'unhealthy'): string {
  const colors: Record<string, string> = {
    healthy: 'text-green-600 dark:text-green-400',
    degraded: 'text-yellow-600 dark:text-yellow-400',
    unhealthy: 'text-red-600 dark:text-red-400',
  };
  return colors[status] || colors.healthy;
}

/**
 * Check if chain is currently healthy
 */
export async function isChainHealthy(chainId: number): Promise<boolean> {
  const stats = await getNetworkStats(chainId);
  return stats ? stats.health.status !== 'unhealthy' : false;
}
