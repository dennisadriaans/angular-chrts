/**
 * Gantt Axis Configuration Builder
 *
 * Pure function for building X-axis configuration.
 */

import type { AxisConfigInterface } from '@unovis/ts';
import { Position } from '@unovis/ts';
import type { GanttXAxisConfigOptions } from '../types';

/**
 * Builds configuration for the X-axis in gantt charts.
 *
 * @param options - Configuration options
 * @returns Axis configuration object
 */
export function buildGanttXAxisConfig<T>(
  options: GanttXAxisConfigOptions
): AxisConfigInterface<T> {
  return {
    type: 'x',
    position: options.position ?? Position.Bottom,
    tickFormat: options.tickFormat,
    numTicks: options.numTicks,
    tickLine: options.tickLine,
    gridLine: options.gridLine,
    domainLine: options.domainLine,
  };
}
