/**
 * Container Config Builder for Bar Chart
 *
 * Pure function for building Unovis XYContainer configuration.
 *
 * SOLID Principles:
 * - SRP: Only responsible for container configuration
 */

import type { GroupedBar, StackedBar, Axis, Tooltip } from '@unovis/ts';

/**
 * Options for building container configuration.
 */
export interface BarContainerConfigOptions<T> {
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  components: Array<GroupedBar<T> | StackedBar<T>>;
  xAxis?: Axis<T>;
  yAxis?: Axis<T>;
  tooltip?: Tooltip;
}

/**
 * Builds configuration for an Unovis XYContainer for bar charts.
 *
 * @param options - Container configuration options
 * @returns Complete container configuration object
 */
export function buildBarContainerConfig<T>(options: BarContainerConfigOptions<T>): Record<string, any> {
  return {
    height: options.height,
    padding: options.padding,
    components: options.components,
    xAxis: options.xAxis,
    yAxis: options.yAxis,
    tooltip: options.tooltip,
  };
}
