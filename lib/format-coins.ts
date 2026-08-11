/**
 * Format coins to display with exactly 2 decimal places
 * @param coins - The coin amount (can be number or string)
 * @returns Formatted string with 2 decimal places and thousand separators
 * @example formatCoins(1234.56) => "1,234.56"
 * @example formatCoins(100) => "100.00"
 */
export function formatCoins(coins: number | string | null | undefined): string {
  const num = typeof coins === 'string' ? parseFloat(coins) : (coins ?? 0);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format coins for display without decimal places (for backward compatibility)
 * @param coins - The coin amount
 * @returns Formatted string without decimals
 */
export function formatCoinsInt(coins: number | string | null | undefined): string {
  const num = typeof coins === 'string' ? parseFloat(coins) : (coins ?? 0);
  return Math.floor(num).toLocaleString('en-US');
}

/**
 * Format offerwall payout (already in USD) for display.
 * Payout of -1 means a variable/unknown reward (displayed as infinity).
 * @param payout - The payout in USD (number or string)
 * @returns Formatted string like "$0.02" or "∞"
 */
export function formatPayout(payout: number | string | null | undefined): string {
  const num = Number(payout ?? 0);
  if (num === -1) return "∞";
  return `$${num.toFixed(2)}`;
}
