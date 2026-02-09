import type { XYContainerConfigInterface } from '@unovis/ts';
import type { GanttContainerConfigOptions } from '../types';

/**
 * Builds configuration for the XYContainer component.
 *
 * @param options - Container configuration options
 * @returns XYContainer configuration object
 */
export function buildGanttContainerConfig<T>(
  options: GanttContainerConfigOptions
): Partial<XYContainerConfigInterface<T>> {
  return {
    height: options.height,
  };
}
