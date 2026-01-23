/**
 * Central export point for all utility functions
 * Import utilities from this file for better organization
 */

// Blockchain utilities
export * from './blockchain';
export { default as blockchainUtils } from './blockchain';

// Wagmi utilities
export * from './wagmi';
export { default as wagmiUtils } from './wagmi';

// Re-export commonly used functions for convenience
export {
  // Address utilities
  validateAddress,
  shortenAddress,
  addressesEqual,

  // Formatting utilities
  formatEther,
  formatGwei,
  formatTokenAmount,
  parseEther,
  parseGwei,
  parseTokenAmount,

  // BigNumber utilities
  compareBigNumbers,
  isZero,
  isPositive,

  // Gas utilities
  calculateGasCost,
  estimateGasCostUSD,

  // Currency utilities
  formatUSD,
  formatNumber,
  formatCompactNumber,

  // Validation utilities
  isValidNumber,
  hasSufficientBalance,
  validateDecimals,
} from './blockchain';

export {
  // Account utilities
  getCurrentAccount,
  getAccountAddress,
  isWalletConnected,
  getConnectorName,

  // Balance utilities
  getNativeBalance,
  getTokenBalance,
  getFormattedBalance,

  // Network utilities
  getCurrentNetwork,
  getCurrentChainId,
  getCurrentChainName,
  isOnChain,
  switchToChain,

  // Chain utilities
  getChainName,
  isTestnet,

  // Explorer utilities
  getExplorerUrl,
  openInExplorer,

  // Constants
  CHAIN_IDS,
  CHAIN_NAMES,
} from './wagmi';
