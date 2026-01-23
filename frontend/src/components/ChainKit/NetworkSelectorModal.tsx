import { useEffect, useState } from 'react';
import {
  getNetworkStats,
  type NetworkStats,
  formatGasPrice,
  findOptimalChain,
} from '../../services/networkStats';

interface NetworkSelectorModalProps {
  isOpen: boolean;
  currentChainId: number;
  availableChainIds: number[];
  onSelectChain: (chainId: number) => void;
  onClose: () => void;
  operationType?: 'simple' | 'nft' | 'swap';
}

export const NetworkSelectorModal: React.FC<NetworkSelectorModalProps> = ({
  isOpen,
  currentChainId,
  availableChainIds,
  onSelectChain,
  onClose,
  operationType = 'nft',
}) => {
  const [networks, setNetworks] = useState<NetworkStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimization, setOptimization] = useState<{
    recommendedChain: NetworkStats | null;
  } | null>(null);
  const [sortBy, setSortBy] = useState<'cost' | 'speed' | 'name'>('cost');

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const stats = await Promise.all(availableChainIds.map(id => getNetworkStats(id))).then(
          results => results.filter((s): s is NetworkStats => s !== null)
        );

        setNetworks(stats);

        const opt = await findOptimalChain(operationType, availableChainIds);
        setOptimization(opt);
      } catch (error) {
        console.error('Failed to load network data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, availableChainIds, operationType]);

  const sortedNetworks = [...networks].sort((a, b) => {
    if (sortBy === 'cost') {
      return a.txCost[operationType] - b.txCost[operationType];
    }
    if (sortBy === 'speed') {
      return a.blockTime - b.blockTime;
    }
    return a.chainName.localeCompare(b.chainName);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white">Select Network</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Operation type:
              {operationType}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-2 transition">
            ✕
          </button>
        </div>

        {/* Sort Controls */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex gap-2">
          {(['cost', 'speed', 'name'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                sortBy === sort
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {sort === 'cost' ? '💰 Cost' : sort === 'speed' ? '⚡ Speed' : '📋 Name'}
            </button>
          ))}
        </div>

        {/* Network List */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedNetworks.map(network => {
                const isCurrentChain = network.chainId === currentChainId;
                const isOptimal = network.chainId === optimization?.recommendedChain?.chainId;
                const txCost = network.txCost[operationType];

                return (
                  <button
                    key={network.chainId}
                    onClick={() => {
                      onSelectChain(network.chainId);
                      onClose();
                    }}
                    disabled={isCurrentChain}
                    className={`w-full p-4 flex items-center justify-between transition ${
                      isCurrentChain
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {network.chainName}
                          {isCurrentChain && (
                            <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                          {isOptimal && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              💡 Optimal
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Gas:
                          {formatGasPrice(parseFloat(network.gasPrice.gwei))} • Block:
                          {network.blockTime}s • Health:
                          {network.health.uptime.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                        ${txCost.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">tx cost</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Recommendation */}
        {optimization?.recommendedChain && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-green-800 dark:text-green-300">✨{optimization.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSelectorModal;
