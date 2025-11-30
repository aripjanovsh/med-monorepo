/**
 * Currency formatting utilities
 * Utilities for formatting currency amounts
 */

/**
 * Format amount with currency (UZS)
 * @param amount - Amount to format
 * @returns Formatted string with currency
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} сум`;
};

/**
 * Format amount in compact form (K, M for thousands/millions)
 * @param amount - Amount to format
 * @returns Compact formatted string
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} млрд сум`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} млн сум`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)} тыс сум`;
  }
  return formatCurrency(amount);
};
