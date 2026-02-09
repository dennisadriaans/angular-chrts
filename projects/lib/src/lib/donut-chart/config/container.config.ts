/**
 * Donut Container Configuration Builder
 *
 * Pure function for building SingleContainer configuration.
 */

import type { SingleContainerConfigInterface } from '@unovis/ts';
import type { DonutContainerConfigOptions } from '../types';

/**
 * Builds configuration for the SingleContainer component.
 *
 * @param options - Container configuration options
 * @returns SingleContainer configuration object
 *
 * @example
 * ```typescript
 * const config = buildDonutContainerConfig({ height: 400 });
 * ```
 */
export function buildDonutContainerConfig<T>(
  options: DonutContainerConfigOptions
): SingleContainerConfigInterface<T> {
  return {
    height: options.height,
    margin: {},
  };
}
