/**
 * Donut Configuration Builder
 *
 * Pure function for building donut component configuration.
 */

import type { DonutConfigInterface } from '@unovis/ts';
import { DonutType, type DonutConfigOptions } from '../types';

/**
 * Calculates the angle range based on donut type.
 *
 * @param type - The donut type (Full or Half)
 * @returns Angle range tuple for half donut, undefined for full
 */
export function calculateAngleRange(type: DonutType): [number, number] | undefined {
  // Half donut: -π/2 to π/2 (top semi-circle)
  return type === DonutType.Half
    ? [-Math.PI / 2, Math.PI / 2]
    : undefined;
}

/**
 * Builds configuration for the Donut component.
 *
 * @param options - Configuration options
 * @returns Donut configuration object
 *
 * @example
 * ```typescript
 * const config = buildDonutConfig({
 *   radius: 10,
 *   arcWidth: 20,
 *   colors: ['#3b82f6', '#ef4444'],
 *   type: DonutType.Full,
 *   padAngle: 0.02
 * });
 * ```
 */
export function buildDonutConfig<T = number>(
  options: DonutConfigOptions
): DonutConfigInterface<T> {
  return {
    value: (d: T) => d as number,
    cornerRadius: options.radius,
    arcWidth: options.arcWidth,
    color: options.colors,
    angleRange: calculateAngleRange(options.type),
    padAngle: options.padAngle,
  };
}
