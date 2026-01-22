import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress, isAddress } from '@ethersproject/address';
import BN from 'bn.js';
import Decimal from 'decimal.js';

/**
 * Blockchain utility functions for handling common operations
 */

// ============================================================================
// Address Utilities
// ============================================================================

/**
 * Validate and format Ethereum address
 */
export function validateAddress(address: string): string | null {
  try {
    if (!isAddress(address)) {
      return null;
    }
    return getAddress(address); // Returns checksummed address
  } catch {
    return null;
  }
}

/**
 * Check if address is valid
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (!isValidAddress(address)) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Compare two addresses (case-insensitive)
 */
export function addressesEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

// ============================================================================
// Number Formatting Utilities
// ============================================================================

/**
 * Format Wei to Ether with specified decimals
 */
export function formatEther(wei: string | BigNumber, decimals: number = 4): string {
  try {
    const ether = formatUnits(wei, 18);
    return parseFloat(ether).toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Format Wei to Gwei
 */
export function formatGwei(wei: string | BigNumber): string {
  try {
    return formatUnits(wei, 9);
  } catch {
    return '0';
  }
}

/**
 * Format tokens with custom decimals
 */
export function formatTokenAmount(
  amount: string | BigNumber,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  try {
    const formatted = formatUnits(amount, decimals);
    return parseFloat(formatted).toFixed(displayDecimals);
  } catch {
    return '0';
  }
}

/**
 * Parse Ether to Wei
 */
export function parseEther(ether: string): BigNumber {
  return parseUnits(ether, 18);
}

/**
 * Parse Gwei to Wei
 */
export function parseGwei(gwei: string): BigNumber {
  return parseUnits(gwei, 9);
}

/**
 * Parse token amount to smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number = 18): BigNumber {
  return parseUnits(amount, decimals);
}

// ============================================================================
// Number Comparison Utilities
// ============================================================================

/**
 * Compare two BigNumbers
 */
export function compareBigNumbers(a: BigNumber, b: BigNumber): number {
  if (a.gt(b)) return 1;
  if (a.lt(b)) return -1;
  return 0;
}

/**
 * Check if BigNumber is zero
 */
export function isZero(value: BigNumber): boolean {
  return value.isZero();
}

/**
 * Check if BigNumber is positive
 */
export function isPositive(value: BigNumber): boolean {
  return value.gt(BigNumber.from(0));
}

// ============================================================================
// Math Utilities with BN.js
// ============================================================================

/**
 * Add two numbers using BN.js
 */
export function addBN(a: string, b: string): string {
  return new BN(a).add(new BN(b)).toString();
}

/**
 * Subtract two numbers using BN.js
 */
export function subtractBN(a: string, b: string): string {
  return new BN(a).sub(new BN(b)).toString();
}

/**
 * Multiply two numbers using BN.js
 */
export function multiplyBN(a: string, b: string): string {
  return new BN(a).mul(new BN(b)).toString();
}

/**
 * Divide two numbers using BN.js
 */
export function divideBN(a: string, b: string): string {
  return new BN(a).div(new BN(b)).toString();
}

// ============================================================================
// Decimal Math Utilities
// ============================================================================

/**
 * Calculate percentage with high precision
 */
export function calculatePercentage(part: string | number, total: string | number): string {
  const partDecimal = new Decimal(part);
  const totalDecimal = new Decimal(total);

  if (totalDecimal.isZero()) return '0';

  return partDecimal.div(totalDecimal).mul(100).toFixed(2);
}

/**
 * Calculate price impact
 */
export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  inputPrice: string,
  outputPrice: string
): string {
  const input = new Decimal(inputAmount).mul(new Decimal(inputPrice));
  const output = new Decimal(outputAmount).mul(new Decimal(outputPrice));

  if (input.isZero()) return '0';

  return output.sub(input).div(input).mul(100).toFixed(4);
}

/**
 * Calculate slippage amount
 */
export function calculateSlippage(amount: string, slippagePercent: number): string {
  const amountDecimal = new Decimal(amount);
  const slippage = new Decimal(slippagePercent).div(100);

  return amountDecimal.mul(new Decimal(1).minus(slippage)).toFixed(0);
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format number as USD
 */
export function formatUSD(amount: number | string, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format number with commas
 */
export function formatNumber(amount: number | string, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format large numbers (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  });
  return formatter.format(num);
}

// ============================================================================
// Gas Utilities
// ============================================================================

/**
 * Calculate gas cost in ETH
 */
export function calculateGasCost(gasUsed: string, gasPrice: string): string {
  const cost = new BN(gasUsed).mul(new BN(gasPrice));
  return formatEther(BigNumber.from(cost.toString()));
}

/**
 * Estimate gas cost in USD
 */
export function estimateGasCostUSD(
  gasLimit: string,
  gasPrice: string,
  ethPriceUSD: number
): string {
  const costETH = calculateGasCost(gasLimit, gasPrice);
  const costUSD = new Decimal(costETH).mul(new Decimal(ethPriceUSD));
  return formatUSD(costUSD.toNumber());
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if string is valid number
 */
export function isValidNumber(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Check if amount has sufficient balance
 */
export function hasSufficientBalance(amount: string, balance: string): boolean {
  try {
    const amountBN = new BN(amount);
    const balanceBN = new BN(balance);
    return balanceBN.gte(amountBN);
  } catch {
    return false;
  }
}

/**
 * Validate decimal places
 */
export function validateDecimals(value: string, maxDecimals: number): boolean {
  const parts = value.split('.');
  if (parts.length === 1) return true;
  if (parts.length === 2) {
    return parts[1].length <= maxDecimals;
  }
  return false;
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert hex to decimal
 */
export function hexToDecimal(hex: string): string {
  return new BN(hex.replace('0x', ''), 16).toString(10);
}

/**
 * Convert decimal to hex
 */
export function decimalToHex(decimal: string): string {
  return '0x' + new BN(decimal).toString(16);
}

/**
 * Convert Wei to token amount for display
 */
export function weiToToken(
  wei: string,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  return formatTokenAmount(wei, decimals, displayDecimals);
}

/**
 * Convert token amount to Wei
 */
export function tokenToWei(amount: string, decimals: number = 18): string {
  return parseTokenAmount(amount, decimals).toString();
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Get time until timestamp
 */
export function getTimeUntil(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============================================================================
// Export all utilities
// ============================================================================

export const blockchainUtils = {
  // Address
  validateAddress,
  isValidAddress,
  shortenAddress,
  addressesEqual,

  // Formatting
  formatEther,
  formatGwei,
  formatTokenAmount,
  parseEther,
  parseGwei,
  parseTokenAmount,

  // Comparison
  compareBigNumbers,
  isZero,
  isPositive,

  // BN Math
  addBN,
  subtractBN,
  multiplyBN,
  divideBN,

  // Decimal Math
  calculatePercentage,
  calculatePriceImpact,
  calculateSlippage,

  // Currency
  formatUSD,
  formatNumber,
  formatCompactNumber,

  // Gas
  calculateGasCost,
  estimateGasCostUSD,

  // Validation
  isValidNumber,
  hasSufficientBalance,
  validateDecimals,

  // Conversion
  hexToDecimal,
  decimalToHex,
  weiToToken,
  tokenToWei,

  // Time
  formatTimestamp,
  getTimeUntil,
};

export default blockchainUtils;
