/**
 * Series Utilities
 *
 * Pure functions for creating and managing series descriptors.
 *
 * SOLID Principles:
 * - SRP: Only responsible for series descriptor operations
 * - OCP: New series operations can be added without modifying existing code
 */

import type { SeriesDescriptor } from '../types';
import { getGradientId } from './svg-generators';

/**
 * Creates series descriptors from category configuration.
 *
 * @param keys - Array of category keys
 * @param colors - Array of colors corresponding to keys
 * @param lineDashArray - Optional array of dash patterns
 * @returns Array of series descriptors
 *
 * @example
 * ```typescript
 * const series = createSeriesDescriptors(
 *   ['revenue', 'expenses'],
 *   ['#3b82f6', '#ef4444'],
 *   [[5, 5], undefined]
 * );
 * ```
 */
export function createSeriesDescriptors(
  keys: string[],
  colors: string[],
  lineDashArray?: number[][]
): SeriesDescriptor[] {
  return keys.map((key, index) => ({
    key,
    color: colors[index],
    gradientId: getGradientId(index, colors[index]),
    lineDashArray: lineDashArray?.[index],
  }));
}

/**
 * Extracts colors from category configuration.
 *
 * @param categories - Category configuration object
 * @returns Array of colors
 *
 * @example
 * ```typescript
 * const colors = extractColors({
 *   revenue: { name: 'Revenue', color: '#3b82f6' },
 *   expenses: { name: 'Expenses', color: ['#ef4444', '#dc2626'] }
 * });
 * // Returns: ['#3b82f6', '#ef4444']
 * ```
 */
export function extractColors(
  categories: Record<string, { color?: string | string[] }>
): string[] {
  return Object.keys(categories).map((key, index) => {
    const color = categories[key].color;
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
export function extractLegendItems<T extends { color?: string | string[] }>(
  categories: Record<string, T>
): Array<T & { color?: string }> {
  return Object.values(categories).map((item) => ({
    ...item,
    color: Array.isArray(item.color) ? item.color[0] : item.color,
  }));
}
