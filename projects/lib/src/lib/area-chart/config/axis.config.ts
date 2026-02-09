import { Position } from '@unovis/ts';
import type { XAxisConfigOptions, YAxisConfigOptions } from '../types';

/**
 * Builds configuration for an Unovis X-Axis component.
 *
 * @param options - X-axis configuration options
 * @returns Complete X-Axis configuration object
 *
 * @example
 * ```typescript
 * const config = buildXAxisConfig({
 *   label: 'Time',
 *   numTicks: 5,
 *   gridLine: true,
 * });
 * ```
 */
export function buildXAxisConfig(options: XAxisConfigOptions): Record<string, any> {
  return {
    type: 'x',
    position: Position.Bottom,
    label: options.label,
    labelMargin: 8,
    numTicks: options.numTicks,
    tickFormat: options.tickFormat,
    tickValues: options.tickValues,
    gridLine: options.gridLine,
    domainLine: options.domainLine,
    tickLine: options.tickLine,
    minMaxTicksOnly: options.minMaxTicksOnly,
  };
}

/**
 * Builds configuration for an Unovis Y-Axis component.
 *
 * @param options - Y-axis configuration options
 * @returns Complete Y-Axis configuration object
 *
 * @example
 * ```typescript
 * const config = buildYAxisConfig({
 *   label: 'Value',
 *   numTicks: 5,
 *   gridLine: true,
 * });
 * ```
 */
export function buildYAxisConfig(options: YAxisConfigOptions): Record<string, any> {
  return {
    type: 'y',
    label: options.label,
    numTicks: options.numTicks,
    tickFormat: options.tickFormat,
    gridLine: options.gridLine,
    domainLine: options.domainLine,
    tickLine: options.tickLine,
  };
}
