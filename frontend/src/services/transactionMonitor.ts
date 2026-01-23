/**
 * Transaction Monitor Service
 * Real-time tracking of transactions across all chains
 */

export interface Transaction {
  hash: string;
  chainId: number;
  from: string;
  to: string;
  type: 'send' | 'mint' | 'swap' | 'list' | 'bridge' | 'other';
  value: string;
  gasUsed?: string;
  gasPaid?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
  confirmations?: number;
  nonce?: number;
}

export interface TransactionBatch {
  userId: string;
  chainId: number;
  transactions: Transaction[];
  totalValue: string;
  successCount: number;
  failureCount: number;
  pendingCount: number;
}

// In-memory transaction cache
const txCache: Map<string, Transaction> = new Map();
const CONFIRMATION_TARGET = 12; // Blocks to consider "confirmed"

/**
 * Track a new transaction
 */
export function trackTransaction(
  txHash: string,
  chainId: number,
  data: Omit<Transaction, 'hash' | 'chainId' | 'confirmations'>
): Transaction {
  const tx: Transaction = {
    ...data,
    hash: txHash,
    chainId,
    confirmations: 0,
  };

  txCache.set(`${chainId}-${txHash}`, tx);
  return tx;
}

/**
 * Get transaction status from cache or RPC
 */
export async function getTransactionStatus(
  chainId: number,
  txHash: string
): Promise<Transaction | null> {
  const cacheKey = `${chainId}-${txHash}`;
  const cached = txCache.get(cacheKey);

  if (cached) return cached;

  try {
    // In production, query chain-specific RPC
    // For now, return mock data
    const tx: Transaction = {
      hash: txHash,
      chainId,
      from: '0x' + '0'.repeat(40),
      to: '0x' + '0'.repeat(40),
      type: 'other',
      value: '0',
      status: 'confirmed',
      timestamp: Date.now() - 60000,
      blockNumber: 1000000,
      confirmations: 100,
    };

    txCache.set(cacheKey, tx);
    return tx;
  } catch (error) {
    console.error(`Failed to get transaction status for ${txHash}:`, error);
    return null;
  }
}

/**
 * Get all transactions for address across chains
 */
export async function getTransactionHistory(
  address: string,
  chainIds: number[],
  limit: number = 50
): Promise<Transaction[]> {
  try {
    // In production, query Moralis, Covalent, or The Graph
    // Moralis: /api/v2/address/transactions
    // Covalent: /v1/address/{address}/transactions
    // The Graph: Query blockchain subgraphs

    const allTxs: Transaction[] = [];

    // Mock implementation
    for (const chainId of chainIds) {
      const mockTxs: Transaction[] = [
        {
          hash: '0x' + Math.random().toString(16).slice(2),
          chainId,
          from: address,
          to: '0x' + '0'.repeat(40),
          type: 'send',
          value: '0.5',
          status: 'confirmed',
          timestamp: Date.now() - 3600000,
          blockNumber: 1000000,
          confirmations: 1000,
        },
      ];

      allTxs.push(...mockTxs);
    }

    return allTxs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    return [];
  }
}

/**
 * Get pending transactions
 */
export async function getPendingTransactions(
  address: string,
  chainIds: number[]
): Promise<Transaction[]> {
  const history = await getTransactionHistory(address, chainIds, 100);
  return history.filter(tx => tx.status === 'pending');
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransactionConfirmation(
  chainId: number,
  txHash: string,
  confirmations: number = CONFIRMATION_TARGET,
  timeout: number = 300000
): Promise<Transaction> {
  const startTime = Date.now();

  return new Promise<Transaction>((resolve, reject) => {
    const checkTx = async () => {
      const tx = await getTransactionStatus(chainId, txHash);

      if (!tx) {
        reject(new Error('Transaction not found'));
        return;
      }

      if ((tx.confirmations || 0) >= confirmations) {
        resolve(tx);
        return;
      }

      if (tx.status === 'failed') {
        reject(new Error('Transaction failed'));
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Transaction confirmation timeout'));
        return;
      }

      setTimeout(checkTx, 5000); // Check every 5 seconds
    };

    checkTx();
  });
}

/**
 * Calculate transaction metrics
 */
export function calculateTransactionMetrics(transactions: Transaction[]): {
  totalValue: number;
  successRate: number;
  avgConfirmationTime: number;
  totalGasSpent: number;
} {
  const successful = transactions.filter(tx => tx.status === 'confirmed');
  const failed = transactions.filter(tx => tx.status === 'failed');
  void failed; // Keep reference for potential future use

  const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
  const totalGasSpent = transactions.reduce((sum, tx) => sum + parseFloat(tx.gasPaid || '0'), 0);
  const successRate = transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0;

  const avgConfirmationTime =
    successful.length > 0
      ? successful.reduce((sum, tx) => sum + (tx.confirmations || 0), 0) / successful.length
      : 0;

  return {
    totalValue,
    successRate,
    avgConfirmationTime,
    totalGasSpent,
  };
}

/**
 * Get transaction status color for UI
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    failed: 'text-red-600 dark:text-red-400',
  };
  return colors[status] || colors.pending;
}

/**
 * Format transaction display
 */
export function formatTransaction(tx: Transaction): {
  display: string;
  status: string;
  time: string;
} {
  const statusStr = tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏳' : '✗';
  const timeStr = new Date(tx.timestamp).toLocaleDateString();

  return {
    display: `${statusStr} ${tx.type.toUpperCase()} ${tx.value} ETH`,
    status: tx.status,
    time: timeStr,
  };
}

/**
 * Clear old transactions from cache
 */
export function clearOldTransactions(olderThanMs: number = 86400000): number {
  let cleared = 0;
  const cutoff = Date.now() - olderThanMs;

  for (const [key, tx] of txCache.entries()) {
    if (tx.timestamp < cutoff && tx.status !== 'pending') {
      txCache.delete(key);
      cleared++;
    }
  }

  return cleared;
}
