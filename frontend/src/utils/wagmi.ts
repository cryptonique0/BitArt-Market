import {
  getAccount,
  getBalance,
  watchAccount,
  getChainId,
  switchChain,
  watchChainId,
} from '@wagmi/core';
import { rainbowkitConfig } from '../config/rainbowkit';
import type { Address } from 'abitype';

/**
 * Wagmi core utilities for programmatic blockchain interactions
 * Use these when you need to access blockchain data outside of React components
 */

// ============================================================================
// Account Utilities
// ============================================================================

/**
 * Get current connected account
 */
export function getCurrentAccount() {
  return getAccount(rainbowkitConfig);
}

/**
 * Get account address
 */
export function getAccountAddress(): Address | undefined {
  const account = getAccount(rainbowkitConfig);
  return account.address;
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  const account = getAccount(rainbowkitConfig);
  return account.isConnected;
}

/**
 * Get connector name (wallet type)
 */
export function getConnectorName(): string | undefined {
  const account = getAccount(rainbowkitConfig);
  return account.connector?.name;
}

/**
 * Watch for account changes
 */
export function onAccountChange(callback: (account: ReturnType<typeof getAccount>) => void) {
  return watchAccount(rainbowkitConfig, callback);
}

// ============================================================================
// Balance Utilities
// ============================================================================

/**
 * Get native balance (ETH) for an address
 */
export async function getNativeBalance(address: Address) {
  return await getBalance(rainbowkitConfig, { address });
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(address: Address, tokenAddress: Address) {
  return await getBalance(rainbowkitConfig, {
    address,
    token: tokenAddress,
  });
}

/**
 * Get formatted balance
 */
export async function getFormattedBalance(
  address: Address,
  tokenAddress?: Address
): Promise<string> {
  try {
    const balance = tokenAddress
      ? await getTokenBalance(address, tokenAddress)
      : await getNativeBalance(address);

    return balance.formatted || '0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// ============================================================================
// Network Utilities
// ============================================================================

/**
 * Get current chain ID
 */
export function getCurrentChainId(): number | undefined {
  // @ts-expect-error - wagmi config type incompatibility with wagmi v2
  return getChainId(rainbowkitConfig);
}

/**
 * Get current chain name
 */
export function getCurrentChainName(): string | undefined {
  const chainId = getCurrentChainId();
  return chainId ? getChainName(chainId) : undefined;
}

/**
 * Check if on specific chain
 */
export function isOnChain(chainId: number): boolean {
  const currentChainId = getCurrentChainId();
  return currentChainId === chainId;
}

/**
 * Switch to specific chain
 */
export async function switchToChain(chainId: number) {
  try {
    // @ts-expect-error - wagmi config type incompatibility with wagmi v2
    await switchChain(rainbowkitConfig, { chainId });
    return true;
  } catch (error) {
    console.error('Error switching chain:', error);
    return false;
  }
}

/**
 * Watch for network changes
 */
export function onNetworkChange(callback: (chainId: number) => void) {
  // @ts-expect-error - wagmi config type incompatibility with wagmi v2
  return watchChainId(rainbowkitConfig, { onChange: callback });
}

// ============================================================================
// Chain Constants
// ============================================================================

export const CHAIN_IDS = {
  ETHEREUM: 1,
  SEPOLIA: 11155111,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BSC: 56,
  AVALANCHE: 43114,
} as const;

export const CHAIN_NAMES = {
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.SEPOLIA]: 'Sepolia',
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.BSC]: 'BNB Smart Chain',
  [CHAIN_IDS.AVALANCHE]: 'Avalanche',
} as const;

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || `Chain ${chainId}`;
}

/**
 * Check if chain is testnet
 */
export function isTestnet(chainId: number): boolean {
  return chainId === CHAIN_IDS.SEPOLIA || chainId === CHAIN_IDS.BASE_SEPOLIA;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get block explorer URL for address
 */
export function getExplorerUrl(
  chainId: number,
  address: string,
  type: 'address' | 'tx' = 'address'
): string {
  const explorers: Record<number, string> = {
    [CHAIN_IDS.ETHEREUM]: 'https://etherscan.io',
    [CHAIN_IDS.SEPOLIA]: 'https://sepolia.etherscan.io',
    [CHAIN_IDS.BASE]: 'https://basescan.org',
    [CHAIN_IDS.BASE_SEPOLIA]: 'https://sepolia.basescan.org',
    [CHAIN_IDS.POLYGON]: 'https://polygonscan.com',
    [CHAIN_IDS.ARBITRUM]: 'https://arbiscan.io',
    [CHAIN_IDS.OPTIMISM]: 'https://optimistic.etherscan.io',
    [CHAIN_IDS.BSC]: 'https://bscscan.com',
    [CHAIN_IDS.AVALANCHE]: 'https://snowtrace.io',
  };

  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/${type}/${address}`;
}

/**
 * Open block explorer for address
 */
export function openInExplorer(
  chainId: number,
  address: string,
  type: 'address' | 'tx' = 'address'
): void {
  const url = getExplorerUrl(chainId, address, type);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  hash: string,
  confirmations: number = 1
): Promise<boolean> {
  // This would use wagmi's waitForTransaction hook in a component
  // For now, this is a placeholder that can be implemented with wagmi
  // eslint-disable-next-line no-console
  console.log(`Waiting for ${confirmations} confirmations for tx ${hash}`);
  return true;
}

// ============================================================================
// Export all utilities
// ============================================================================

export const wagmiUtils = {
  // Account
  getCurrentAccount,
  getAccountAddress,
  isWalletConnected,
  getConnectorName,
  onAccountChange,

  // Balance
  getNativeBalance,
  getTokenBalance,
  getFormattedBalance,

  // Network
  getCurrentChainId,
  getCurrentChainName,
  isOnChain,
  switchToChain,
  onNetworkChange,

  // Chain Info
  getChainName,
  isTestnet,

  // Explorer
  getExplorerUrl,
  openInExplorer,

  // Transaction
  waitForTransaction,

  // Constants
  CHAIN_IDS,
  CHAIN_NAMES,
};

export default wagmiUtils;
