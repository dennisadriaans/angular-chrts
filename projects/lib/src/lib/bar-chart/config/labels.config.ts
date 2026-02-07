/**
 * Bar Chart Labels Config Builder
 *
 * Pure function for building Unovis XYLabels component configuration for bar charts.
 */

import { XYLabels, Orientation } from '@unovis/ts';

/**
 * Builds configuration for an Unovis XYLabels component for bar charts.
 *
 * @param options - Label configuration options
 * @returns Complete XYLabels configuration object
 */
export function buildBarLabelsConfig<T>(
  options: {
    x: (d: T, i: number) => number;
    y: (d: T) => number;
    color: string | ((d: T) => string);
    backgroundColor?: string | ((d: T) => string);
    label?: (d: T) => string | undefined;
    labelVerticalOffset?: string;
    orientation?: Orientation;
  }
): any {
  const attributes: Record<string, any> = {};

  if (options.labelVerticalOffset) {
    // We add a data attribute to the label group so we can target it with CSS
    // to apply the vertical offset to the text and background elements.
    attributes[XYLabels.selectors.label] = {
      'data-ngx-label-floating': 'true',
    };
  }

  const isHorizontal = options.orientation === Orientation.Horizontal;

  return {
    x: isHorizontal ? options.y : options.x,
    y: isHorizontal ? options.x : options.y,
    color: options.color,
    backgroundColor: options.backgroundColor,
    label: options.label,
    attributes,
  };
}
