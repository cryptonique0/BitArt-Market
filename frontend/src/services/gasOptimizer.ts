/**
 * Gas Optimizer Service
 * Find cheapest chains, optimize transaction paths, estimate savings
 */

import { getNetworkStats, NetworkStats } from './networkStats';

export interface OptimizationResult {
  currentChain: NetworkStats | null;
  recommendedChain: NetworkStats | null;
  savingsETH: number;
  savingsPercent: number;
  operationType: string;
  reasoning: string;
}

export interface ChainOptimization {
  chainId: number;
  gasScore: number;
  speedScore: number;
  costScore: number;
  overallScore: number;
}

/**
 * Find the optimal chain for a transaction
 */
export async function findOptimalChain(
  operationType: 'simple' | 'nft' | 'swap' | 'dex',
  availableChainIds: number[]
): Promise<OptimizationResult> {
  try {
    const stats = await Promise.all(availableChainIds.map(id => getNetworkStats(id))).then(
      results => results.filter((s): s is NetworkStats => s !== null)
    );

    if (stats.length === 0) {
      return {
        currentChain: null,
        recommendedChain: null,
        savingsETH: 0,
        savingsPercent: 0,
        operationType,
        reasoning: 'No available networks',
      };
    }

    // Score chains
    const scored = stats.map(chain => scoreChain(chain, operationType));
    scored.sort((a, b) => b.overallScore - a.overallScore);

    const recommended = stats.find(s => s.chainId === scored[0].chainId) || stats[0];
    const mostExpensive = stats.reduce((max, s) =>
      s.txCost[operationType as keyof typeof s.txCost] >
      max.txCost[operationType as keyof typeof max.txCost]
        ? s
        : max
    );

    const txCost = operationType as keyof typeof recommended.txCost;
    const savingsETH = mostExpensive.txCost[txCost] - recommended.txCost[txCost];
    const savingsPercent = (savingsETH / mostExpensive.txCost[txCost]) * 100;

    return {
      currentChain: stats[0],
      recommendedChain: recommended,
      savingsETH,
      savingsPercent,
      operationType,
      reasoning: getOptimizationReasoning(recommended, savingsPercent),
    };
  } catch (error) {
    console.error('Failed to find optimal chain:', error);
    return {
      currentChain: null,
      recommendedChain: null,
      savingsETH: 0,
      savingsPercent: 0,
      operationType,
      reasoning: 'Error finding optimal chain',
    };
  }
}

/**
 * Score a chain based on operation type
 */
function scoreChain(chain: NetworkStats, operationType: string): ChainOptimization {
  const txCost = chain.txCost[operationType as keyof typeof chain.txCost] || 0;

  // Normalize scores to 0-100
  const gasCostNormalized = Math.max(0, 100 - txCost * 1000); // Lower cost = higher score
  const speedNormalized = Math.max(0, 100 - chain.blockTime * 10); // Faster block time = higher score
  const healthNormalized = chain.health.uptime; // Direct uptime percentage

  // Weighted scoring
  const weights = {
    gas: 0.6, // 60% weight on cost
    speed: 0.25, // 25% weight on speed
    health: 0.15, // 15% weight on health
  };

  const overallScore =
    gasCostNormalized * weights.gas +
    speedNormalized * weights.speed +
    healthNormalized * weights.health;

  return {
    chainId: chain.chainId,
    gasScore: gasCostNormalized,
    speedScore: speedNormalized,
    costScore: gasCostNormalized,
    overallScore,
  };
}

/**
 * Get human-readable reasoning for recommendation
 */
function getOptimizationReasoning(chain: NetworkStats, savingsPercent: number): string {
  if (savingsPercent > 80) {
    return `Huge savings! ${chain.chainName} is ${savingsPercent.toFixed(0)}% cheaper.`;
  }
  if (savingsPercent > 50) {
    return `Great savings on ${chain.chainName} - save ${savingsPercent.toFixed(0)}% on gas.`;
  }
  if (savingsPercent > 20) {
    return `${chain.chainName} offers moderate savings of ${savingsPercent.toFixed(0)}%.`;
  }
  return `${chain.chainName} is slightly cheaper with minor savings.`;
}

/**
 * Estimate total cost for transaction path
 */
export async function estimateTransactionPath(
  fromChain: number,
  toChain: number,
  operationType: 'simple' | 'nft' | 'swap',
  needsBridge: boolean = false
): Promise<{
  totalCostETH: number;
  totalCostUSD: number;
  breakdown: {
    sourceTx: number;
    bridgeFee: number;
    destinationTx: number;
  };
}> {
  try {
    const fromStats = await getNetworkStats(fromChain);
    const toStats = await getNetworkStats(toChain);

    if (!fromStats || !toStats) {
      return {
        totalCostETH: 0,
        totalCostUSD: 0,
        breakdown: { sourceTx: 0, bridgeFee: 0, destinationTx: 0 },
      };
    }

    const sourceTx = fromStats.txCost[operationType];
    const destinationTx = toStats.txCost[operationType];
    const bridgeFee = needsBridge ? 0.001 : 0; // Mock: 0.001 ETH bridge fee

    const totalCostETH = sourceTx + destinationTx + bridgeFee;
    const totalCostUSD = totalCostETH * 2500; // Approximate ETH price

    return {
      totalCostETH,
      totalCostUSD,
      breakdown: {
        sourceTx,
        bridgeFee,
        destinationTx,
      },
    };
  } catch (error) {
    console.error('Failed to estimate transaction path:', error);
    return {
      totalCostETH: 0,
      totalCostUSD: 0,
      breakdown: { sourceTx: 0, bridgeFee: 0, destinationTx: 0 },
    };
  }
}

/**
 * Compare chains for specific operation
 */
export async function compareChains(
  chainIds: number[],
  operationType: 'simple' | 'nft' | 'swap'
): Promise<ChainOptimization[]> {
  try {
    const stats = await Promise.all(chainIds.map(id => getNetworkStats(id))).then(results =>
      results.filter((s): s is NetworkStats => s !== null)
    );

    return stats.map(chain => scoreChain(chain, operationType));
  } catch (error) {
    console.error('Failed to compare chains:', error);
    return [];
  }
}

/**
 * Get batch optimization (multiple operations on optimal chains)
 */
export async function optimizeBatchOperations(
  operations: Array<{
    type: 'simple' | 'nft' | 'swap';
    count: number;
  }>,
  availableChainIds: number[]
): Promise<{
  totalSavings: number;
  optimizedPlan: Array<{
    operation: string;
    recommendedChain: string;
    estimatedCost: number;
  }>;
}> {
  try {
    const stats = await Promise.all(availableChainIds.map(id => getNetworkStats(id))).then(
      results => results.filter((s): s is NetworkStats => s !== null)
    );

    let totalSavings = 0;
    const optimizedPlan = [];

    for (const op of operations) {
      const mostExpensive = stats.reduce((max, s) =>
        s.txCost[op.type] > max.txCost[op.type] ? s : max
      );

      const cheapest = stats.reduce((min, s) =>
        s.txCost[op.type] < min.txCost[op.type] ? s : min
      );

      const savingsPerTx = mostExpensive.txCost[op.type] - cheapest.txCost[op.type];
      const totalOpSavings = savingsPerTx * op.count;
      totalSavings += totalOpSavings;

      optimizedPlan.push({
        operation: `${op.count}x ${op.type}`,
        recommendedChain: cheapest.chainName,
        estimatedCost: cheapest.txCost[op.type] * op.count,
      });
    }

    return {
      totalSavings,
      optimizedPlan,
    };
  } catch (error) {
    console.error('Failed to optimize batch operations:', error);
    return {
      totalSavings: 0,
      optimizedPlan: [],
    };
  }
}

/**
 * Format optimization result for display
 */
export function formatOptimizationResult(result: OptimizationResult): {
  title: string;
  subtitle: string;
  savings: string;
  action: string;
} {
  return {
    title: result.recommendedChain?.chainName || 'Unknown',
    subtitle: `Recommended for ${result.operationType}`,
    savings: `Save ${result.savingsPercent.toFixed(1)}% (${result.savingsETH.toFixed(4)} ETH)`,
    action: result.recommendedChain
      ? `Switch to ${result.recommendedChain.chainName}`
      : 'No recommendation available',
  };
}
