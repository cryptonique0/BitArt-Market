import React from 'react';
import { type TransactionHistoryItem } from '../services/messaging';

interface TransactionHistoryProps {
  transactions: TransactionHistoryItem[];
}

/**
 * TransactionHistory Component
 * Displays transaction history linked to conversation
 */
export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction History</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {transactions.map((txn, idx) => (
          <div
            key={`${txn.transactionHash}-${idx}`}
            className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-3">
              {txn.nftImage && (
                <img
                  src={txn.nftImage}
                  alt={txn.nftName}
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {txn.nftName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {txn.transactionType.charAt(0).toUpperCase() + txn.transactionType.slice(1)} ·{' '}
                  {txn.amount} {txn.currency}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(txn.timestamp).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  txn.status === 'completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                }`}
              >
                {txn.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
