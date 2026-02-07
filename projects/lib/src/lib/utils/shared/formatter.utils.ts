/**
 * Shared Formatter Utilities
 *
 * Common formatting functions used across chart components.
 */

import { isBrowser } from '../browser';

/**
 * Creates a tick formatter function with fallback to string conversion.
 *
 * @param formatter - Optional custom formatter
 * @returns Formatter function
 *
 * @example
 * ```typescript
 * const format = createTickFormatter((tick) => `$${tick}`);
 * format(100, 0, [100, 200]) // '$100'
 * ```
 */
export function createTickFormatter(
  formatter?: (tick: number | Date, i?: number, ticks?: (number | Date)[]) => string
): (tick: number | Date, i?: number, ticks?: (number | Date)[]) => string {
  return (tick: number | Date, i?: number, ticks?: (number | Date)[]): string => {
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };
}

/**
 * Creates a cached date formatter for SSR-safe date formatting.
 * Returns a simple string conversion in non-browser environments.
 *
 * @returns Date formatter function
 */
export function createDateFormatter(): (date: number | Date) => string {
  if (!isBrowser()) {
    return (date: number | Date) => String(date);
  }
  const formatter = new Intl.DateTimeFormat();
  return (date: number | Date) =>
    formatter.format(typeof date === 'number' ? date : date.getTime());
}

/**
 * Creates a tick format function with date formatter fallback.
 *
 * @param customFormatter - Optional custom formatter
 * @returns Tick format function
 */
export function createDateTickFormatter(
  customFormatter?: (tick: number | Date, i?: number, ticks?: (number | Date)[]) => string
): (tick: number | Date, i?: number, ticks?: (number | Date)[]) => string {
  const dateFormatter = createDateFormatter();
  return (tick: number | Date, i?: number, ticks?: (number | Date)[]): string => {
    if (customFormatter) return customFormatter(tick, i, ticks);
    return dateFormatter(tick);
  };
}
