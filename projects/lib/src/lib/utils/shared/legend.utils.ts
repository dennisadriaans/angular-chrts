/**
 * Shared Legend Utilities
 *
 * Common legend handling functions used across all chart components.
 *
 * SOLID Principles:
 * - SRP: Only responsible for legend operations
 * - DRY: Single source of truth for legend handling
 */

import type { BulletLegendItemInterface } from '../../types';

/**
 * Normalized legend item with single color value.
 */
export type NormalizedLegendItem = BulletLegendItemInterface & { color?: string };

/**
 * Extracts and normalizes legend items from category configuration.
 * Converts color arrays to single values for consistent rendering.
 *
 * @param categories - Category configuration object
 * @returns Array of legend items with normalized colors
 *
 * @example
 * ```typescript
 * const items = extractLegendItems({
 *   revenue: { name: 'Revenue', color: '#3b82f6' },
 *   expenses: { name: 'Expenses', color: ['#ef4444', '#dc2626'] }
 * });
 * // Returns: [{ name: 'Revenue', color: '#3b82f6' }, { name: 'Expenses', color: '#ef4444' }]
 * ```
 */
export function extractLegendItems<T extends { color?: string | string[] }>(
  categories: Record<string, T>
): Array<T & { color?: string }> {
  return Object.values(categories).map((item) => ({
    ...item,
    color: Array.isArray(item.color) ? item.color[0] : item.color,
  }));
}

/**
 * Gets the CSS justify-content value from legend position string.
 *
 * @param position - Legend position string (e.g., 'top-left', 'bottom-center')
 * @returns CSS justify-content value
 *
 * @example
 * ```typescript
 * getLegendAlignment('top-left') // 'flex-start'
 * getLegendAlignment('bottom-center') // 'center'
 * getLegendAlignment('top-right') // 'flex-end'
 * ```
 */
export function getLegendAlignment(position: string): string {
  if (position.includes('left')) return 'flex-start';
  if (position.includes('right')) return 'flex-end';
  return 'center';
}

/**
 * Checks if legend should be positioned at top of chart.
 *
 * @param position - Legend position string
 * @returns True if legend is at top
 */
export function isLegendAtTop(position: string): boolean {
  return position.startsWith('top');
}
