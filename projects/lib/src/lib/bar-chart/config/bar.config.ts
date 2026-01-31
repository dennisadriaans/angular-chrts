/**
 * Bar Config Builders
 *
 * Pure functions for building Unovis bar component configurations.
 *
 * SOLID Principles:
 * - SRP: Only responsible for bar configuration
 * - OCP: New bar options can be added without modifying existing code
 * - DIP: Depends on abstractions (interfaces) not concrete implementations
 */

import { Orientation } from '@unovis/ts';
import type { BarConfig, BarConfigOptions } from '../types';

/**
 * Builds configuration for a grouped bar component.
 *
 * @param options - Bar configuration options
 * @returns Complete GroupedBar configuration object
 *
 * @example
 * ```typescript
 * const config = buildGroupedBarConfig({
 *   yAccessors: [(d) => d.value1, (d) => d.value2],
 *   colors: ['#3b82f6', '#ef4444'],
 *   barPadding: 0.2,
 *   groupPadding: 0,
 *   orientation: Orientation.Vertical,
 * });
 * ```
 */
export function buildGroupedBarConfig<T>(options: BarConfigOptions<T>): BarConfig<T> {
  return {
    x: (_: T, i: number) => i,
    y: options.yAccessors,
    color: options.colors,
    roundedCorners: options.radius ?? 0,
    groupPadding: options.groupPadding ?? 0,
    barPadding: options.barPadding,
    orientation: options.orientation,
  };
}

/**
 * Builds configuration for a stacked bar component.
 *
 * @param options - Bar configuration options
 * @returns Complete StackedBar configuration object
 *
 * @example
 * ```typescript
 * const config = buildStackedBarConfig({
 *   yAccessors: [(d) => d.value1, (d) => d.value2],
 *   colors: ['#3b82f6', '#ef4444'],
 *   barPadding: 0.2,
 *   orientation: Orientation.Vertical,
 * });
 * ```
 */
export function buildStackedBarConfig<T>(options: BarConfigOptions<T>): BarConfig<T> {
  return {
    x: (_: T, i: number) => i,
    y: options.yAccessors,
    color: options.colors,
    roundedCorners: options.radius ?? 0,
    barPadding: options.barPadding,
    orientation: options.orientation,
  };
}
