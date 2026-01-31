/**
 * Shared Color Utilities
 *
 * Common color handling functions used across all chart components.
 *
 * SOLID Principles:
 * - SRP: Only responsible for color operations
 * - DRY: Single source of truth for color handling
 */

import type { BulletLegendItemInterface } from '@unovis/ts';

/**
 * Normalizes a color value to a single string.
 * Handles arrays by taking the first value.
 *
 * @param color - Color value (string, array, or undefined)
 * @param fallback - Fallback color if undefined
 * @returns Normalized single color string
 *
 * @example
 * ```typescript
 * normalizeColor('#3b82f6') // '#3b82f6'
 * normalizeColor(['#3b82f6', '#60a5fa']) // '#3b82f6'
 * normalizeColor(undefined, '#ccc') // '#ccc'
 * ```
 */
export function normalizeColor(
  color: string | string[] | undefined,
  fallback = '#ccc'
): string {
  if (!color) return fallback;
  return Array.isArray(color) ? color[0] || fallback : color;
}

/**
 * Extracts colors from category configuration.
 * Each category can have a single color or array of colors.
 *
 * @param categories - Category configuration object with color property
 * @returns Array of colors (first color if array)
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
  return Object.values(categories).map((item, index) => {
    const color = item.color;
    if (Array.isArray(color)) return color[0] ?? `var(--vis-color${index})`;
    return color ?? `var(--vis-color${index})`;
  });
}

/**
 * Gets the color for a category with CSS variable fallback.
 *
 * @param category - Category configuration
 * @param index - Index for fallback CSS variable
 * @returns Color string
 */
export function getCategoryColor(
  category: BulletLegendItemInterface | undefined,
  index: number
): string {
  if (!category) return `var(--vis-color${index})`;
  const color = category.color;
  if (typeof color === 'string') return color;
  if (Array.isArray(color) && color[0]) return color[0];
  return `var(--vis-color${index})`;
}
