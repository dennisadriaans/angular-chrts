import { Position, Orientation } from '@unovis/ts';
import type { BarXAxisConfigOptions, BarYAxisConfigOptions } from '../types';

/**
 * Builds configuration for an Unovis X-Axis component for bar charts.
 *
 * @param options - X-axis configuration options
 * @returns Complete X-Axis configuration object
 */
export function buildBarXAxisConfig(options: BarXAxisConfigOptions): Record<string, any> {
  return {
    type: 'x',
    position: Position.Bottom,
    label: options.label,
    tickFormat: options.tickFormat,
    gridLine: options.gridLine,
    domainLine: !!options.domainLine,
    tickLine: options.tickLine,
    numTicks: options.numTicks,
    tickValues: options.tickValues,
    minMaxTicksOnly: options.minMaxTicksOnly,
  };
}

/**
 * Builds configuration for an Unovis Y-Axis component for bar charts.
 *
 * @param options - Y-axis configuration options
 * @returns Complete Y-Axis configuration object
 */
export function buildBarYAxisConfig(options: BarYAxisConfigOptions): Record<string, any> {
  // In horizontal mode, disable Y grid lines
  const gridLine = options.orientation !== Orientation.Horizontal && options.gridLine;

  return {
    type: 'y',
    label: options.label,
    tickFormat: options.tickFormat,
    gridLine,
    domainLine: !!options.domainLine,
    numTicks: options.numTicks,
    tickLine: options.tickLine,
  };
}
