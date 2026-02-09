import type { TimelineConfigInterface } from '@unovis/ts';
import type { TimelineConfigOptions } from '../types';

/**
 * Builds configuration for the Timeline component.
 *
 * @param options - Configuration options
 * @returns Timeline configuration object
 */
export function buildTimelineConfig<T>(
  options: TimelineConfigOptions<T>
): TimelineConfigInterface<T> {
  return {
    x: options.x,
    length: options.length,
    lineWidth: options.lineWidth,
    rowHeight: options.rowHeight,
    type: options.type,
    color: options.colors,
    labelWidth: options.labelWidth,
    showLabels: options.showLabels,
  };
}
