import React, { useEffect, useState } from 'react';
import {
  getTransactionHistory,
  getPendingTransactions,
  calculateTransactionMetrics,
  formatTransaction,
  getStatusColor,
} from '../../services/transactionMonitor';
import { type Transaction } from '../../services/transactionMonitor';
import { getChainName } from '../../utils';

interface TransactionMonitorProps {
  userAddress?: string;
  chainIds: number[];
  limit?: number;
}

export const TransactionMonitor: React.FC<TransactionMonitorProps> = ({
  userAddress,
  chainIds,
  limit = 20,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pending, setPending] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<{
    successRate: number;
    totalValue: number;
    totalGasSpent: number;
    avgConfirmationTime: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      if (!userAddress) return;

      setLoading(true);
      try {
        const history = await getTransactionHistory(userAddress, chainIds, limit);
        const pendingTxs = await getPendingTransactions(userAddress, chainIds);

        setTransactions(history);
        setPending(pendingTxs);

        const allTxs = [...history, ...pendingTxs];
        const calcs = calculateTransactionMetrics(allTxs);
        setMetrics(calcs);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
    const interval = setInterval(loadTransactions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userAddress, chainIds, limit]);

  const filteredTxs = (() => {
    let txs = [...transactions, ...pending];
    if (filter === 'pending') txs = txs.filter(tx => tx.status === 'pending');
    if (filter === 'confirmed') txs = txs.filter(tx => tx.status === 'confirmed');
    if (filter === 'failed') txs = txs.filter(tx => tx.status === 'failed');
    return txs.sort((a, b) => b.timestamp - a.timestamp);
  })();

  if (!userAddress) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Connect wallet to view transaction history
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {metrics.successRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">
              Total Value
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              ${metrics.totalValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded p-3 border border-orange-200 dark:border-orange-700">
            <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold">
              Gas Spent
            </p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
              ${metrics.totalGasSpent.toFixed(4)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded p-3 border border-purple-200 dark:border-purple-700">
            <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-semibold">
              Pending
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {pending.length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Pending Transactions Alert */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
            ⏳{pending.length} pending transaction(s)
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
            These may take several minutes to confirm.
          </p>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {filteredTxs.map(tx => {
              const formatted = formatTransaction(tx);
              const statusColor = getStatusColor(tx.status);

              return (
                <a
                  key={`${tx.chainId}-${tx.hash}`}
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {tx.type}
                      </span>
                      <span className={`text-xs font-bold ${statusColor}`}>
                        {tx.status === 'confirmed' && '✓ Confirmed'}
                        {tx.status === 'pending' && '⏳ Pending'}
                        {tx.status === 'failed' && '✗ Failed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium">
                        {getChainName(tx.chainId)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">{formatted.time}</span>
                      {tx.confirmations && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {tx.confirmations} confirmations
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {tx.value} ETH
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      View on Explorer →
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionMonitor;
