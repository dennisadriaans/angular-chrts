/**
 * XYLabels Config Builder
 *
 * Pure function for building Unovis XYLabels component configuration.
 */

import type { XYLabelsConfig } from '../types';

/**
 * Builds configuration for an Unovis XYLabels component.
 *
 * @param options - The x, y-accessor, color and label configuration
 * @returns Complete XYLabels configuration object
 */
export function buildLabelsConfig<T>(
  options: {
    x: (d: T) => number | undefined;
    y: (d: T) => number;
    color: string | ((d: T) => string);
    backgroundColor?: string | ((d: T) => string);
    label?: (d: T) => string | undefined;
  }
): XYLabelsConfig<T> {
  return {
    x: options.x,
    y: options.y,
    color: options.color,
    backgroundColor: options.backgroundColor,
    label: options.label,
    attributes: {},
    events: {},
  };
}
