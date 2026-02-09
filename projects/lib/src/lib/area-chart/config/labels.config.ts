import { XYLabels } from '@unovis/ts';
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
    yOffset?: string;
  }
): XYLabelsConfig<T> {
  const attributes: Record<string, any> = {};

  if (options.yOffset) {
    // We add a data attribute to the label group so we can target it with CSS
    // to apply the vertical offset to the text element.
    attributes[XYLabels.selectors.label] = {
      'data-ngx-label-floating': 'true',
    };
  }

  return {
    x: options.x,
    y: options.y,
    color: options.color,
    backgroundColor: options.backgroundColor,
    label: options.label,
    attributes,
    events: {},
  };
}
