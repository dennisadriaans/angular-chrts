/**
 * Series Utilities
 *
 * Pure functions for creating and managing series descriptors.
 * Re-exports shared utilities for backward compatibility.
 */

import type { SeriesDescriptor } from '../types';
import { getGradientId } from './svg-generators';

// Re-export shared utilities
export {
  extractColors,
  extractLegendItems,
} from '../../utils/shared';

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
