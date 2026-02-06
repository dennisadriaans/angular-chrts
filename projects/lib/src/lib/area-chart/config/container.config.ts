/**
 * Container Config Builder
 *
 * Pure function for building Unovis XYContainer configuration.
 *
 * SOLID Principles:
 * - SRP: Only responsible for container configuration
 * - OCP: New container options can be added without modifying existing code
 */

import type { Area, Line, XYLabels, Axis, Crosshair, Tooltip } from '@unovis/ts';

/**
 * Options for building container configuration.
 */
export interface ContainerConfigOptions<T> {
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  yDomain?: [number, number];
  xDomain?: [number, number];
  components: Array<Area<T> | Line<T> | XYLabels<T>>;
  xAxis?: Axis<T>;
  yAxis?: Axis<T>;
  crosshair?: Crosshair<T>;
  tooltip?: Tooltip;
}

/**
 * Builds configuration for an Unovis XYContainer.
 *
 * @param options - Container configuration options
 * @returns Complete container configuration object
 *
 * @example
 * ```typescript
 * const config = buildContainerConfig({
 *   height: 400,
 *   padding: { top: 0, right: 0, bottom: 0, left: 0 },
 *   components: [...areas, ...lines],
 *   xAxis: xAxisInstance,
 *   yAxis: yAxisInstance,
 * });
 * ```
 */
export function buildContainerConfig<T>(options: ContainerConfigOptions<T>): Record<string, any> {
  return {
    height: options.height,
    padding: options.padding,
    yDomain: options.yDomain,
    xDomain: options.xDomain,
    components: options.components,
    xAxis: options.xAxis,
    yAxis: options.yAxis,
    crosshair: options.crosshair,
    tooltip: options.tooltip,
  };
}
