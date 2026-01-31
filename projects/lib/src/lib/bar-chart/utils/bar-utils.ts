/**
 * Bar Chart Utilities
 *
 * Pure functions for bar chart data processing.
 *
 * SOLID Principles:
 * - SRP: Only responsible for data utilities
 * - OCP: New utilities can be added without modifying existing code
 */

import type { NumericAccessor } from '@unovis/ts';

/**
 * Creates Y-axis accessors from data keys.
 *
 * @param keys - Array of property keys to create accessors for
 * @returns Array of accessor functions
 *
 * @example
 * ```typescript
 * const accessors = createYAccessors<DataPoint>(['value1', 'value2']);
 * // accessors[0](data) returns data.value1
 * // accessors[1](data) returns data.value2
 * ```
 */
export function createYAccessors<T extends Record<string, unknown>>(
  keys: Array<keyof T>
): NumericAccessor<T>[] {
  return keys.map((key) => (d: T) => d[key] as number);
}

/**
 * Extracts colors from category configuration.
 *
 * @param categories - Category configuration object
 * @returns Array of colors
 *
 * @example
 * ```typescript
 * const colors = extractBarColors({
 *   revenue: { name: 'Revenue', color: '#3b82f6' },
 *   expenses: { name: 'Expenses', color: ['#ef4444', '#dc2626'] }
 * });
 * // Returns: ['#3b82f6', '#ef4444']
 * ```
 */
export function extractBarColors(
  categories: Record<string, { color?: string | string[] }>
): string[] {
  return Object.values(categories).map((item, index) => {
    const color = item.color;
    if (Array.isArray(color)) return color[0] ?? `var(--vis-color${index})`;
    return color ?? `var(--vis-color${index})`;
  });
}

/**
 * Extracts legend items from category configuration.
 * Normalizes color arrays to single values.
 *
 * @param categories - Category configuration object
 * @returns Array of legend item configurations
 */
export function extractBarLegendItems<T extends { color?: string | string[] }>(
  categories: Record<string, T>
): Array<T & { color?: string }> {
  return Object.values(categories).map((item) => ({
    ...item,
    color: Array.isArray(item.color) ? item.color[0] : item.color,
  }));
}

/**
 * Creates a tick formatter function with fallback to string conversion.
 *
 * @param formatter - Optional custom formatter
 * @returns Formatter function
 */
export function createTickFormatter(
  formatter?: (tick: number | Date, i: number, ticks: (number | Date)[]) => string
): (tick: number | Date, i: number, ticks: (number | Date)[]) => string {
  return (tick: number | Date, i: number, ticks: (number | Date)[]): string => {
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };
}
