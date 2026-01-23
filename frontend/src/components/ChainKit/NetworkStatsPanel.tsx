import { useEffect, useState, useMemo } from 'react';
import {
  getNetworkStats,
  type NetworkStats,
  findCheapestChain,
  getChainRecommendation,
  formatGasPrice,
} from '../../services/networkStats';

export const NetworkStatsPanel: React.FC<{ chainId?: number }> = ({ chainId }) => {
  const [allStats, setAllStats] = useState<NetworkStats[]>([]);
  const [currentStats, setCurrentStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  const chainIds = useMemo(
    () => [1, 8453, 10, 42161, 137, 56, 43114, 11155111, 84532] as const,
    []
  );

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const stats: NetworkStats[] = [];

      for (const id of chainIds) {
        const stat = await getNetworkStats(id);
        if (stat) stats.push(stat);
      }

      setAllStats(stats);

      if (chainId) {
        const current = stats.find(s => s.chainId === chainId);
        setCurrentStats(current || null);
      }

      setLoading(false);
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [chainIds, chainId]);

  const cheapest = useMemo(() => findCheapestChain(allStats, 'nft'), [allStats]);
  const balanced = useMemo(
    () => getChainRecommendation(allStats, { priority: 'balanced' }),
    [allStats]
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Chain Stats */}
      {currentStats && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentStats.chainName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Network Statistics</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentStats.health.status === 'healthy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}
            >
              {currentStats.health.status === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Gas Price
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatGasPrice(parseFloat(currentStats.gasPrice.gwei))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Standard: {currentStats.gasPrice.standard} Gwei
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                NFT Cost
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${currentStats.txCost.nft.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Swap: ${currentStats.txCost.swap.toFixed(4)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                TVL
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{currentStats.tvl}</p>
              <p className="text-xs text-gray-500 mt-1">
                Vol:
                {currentStats.dailyVolume}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Block Time
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentStats.blockTime}s
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg latency: {currentStats.health.avgLatency}ms
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Active Users
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {(currentStats.activeUsers / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Uptime:
                {currentStats.health.uptime}%
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Simple Tx
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${currentStats.txCost.simple.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {cheapest && balanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-2">
              💰 Cheapest for NFTs
            </h4>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {cheapest.chain.chainName}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              NFT Cost: ${cheapest.chain.txCost.nft.toFixed(4)}
            </p>
            {cheapest.savings > 0 && (
              <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-1">
                Save ~${cheapest.savings.toFixed(4)}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
              ⚡ Best Balanced
            </h4>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {balanced.chainName}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Gas: {balanced.gasPrice.standard} Gwei • Block:
              {balanced.blockTime}s
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 font-semibold mt-1">
              Cost vs Speed Optimized
            </p>
          </div>
        </div>
      )}

      {/* All Networks Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">All Networks</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allStats.map(stat => (
            <div
              key={stat.chainId}
              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {stat.chainName}
                </p>
                <p className="text-xs text-gray-500">
                  Gas:
                  {stat.gasPrice.standard}
                  Gw • NFT: ${stat.txCost.nft.toFixed(4)}
                </p>
              </div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded ${stat.health.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800'}`}
              >
                {stat.health.uptime.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatsPanel;
