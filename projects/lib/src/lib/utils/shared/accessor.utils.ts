/**
 * Shared Accessor Utilities
 *
 * Common data accessor creation functions used across chart components.
 *
 * SOLID Principles:
 * - SRP: Only responsible for accessor creation
 * - DRY: Single source of truth for accessor patterns
 */

import type { NumericAccessor } from '@unovis/ts';

/**
 * Creates Y-axis accessors from data keys.
 * Returns accessor functions that extract numeric values from data objects.
 *
 * @param keys - Array of property keys to create accessors for
 * @returns Array of accessor functions
 *
 * @example
 * ```typescript
 * const accessors = createYAccessors<DataPoint>(['value1', 'value2']);
 * // accessors[0](data) returns data.value1
 * // accessors[1](data) returns data.value2
 * ```
 */
export function createYAccessors<T extends Record<string, unknown>>(
  keys: Array<keyof T>
): NumericAccessor<T>[] {
  return keys.map((key) => (d: T) => d[key] as number);
}

/**
 * Creates y-accessors for stacked area mode.
 * Each accessor returns the raw value for its key.
 *
 * @param keys - Array of data property keys
 * @returns Array of accessor functions
 */
export function createStackedYAccessors<T extends Record<string, unknown>>(
  keys: string[]
): Array<(d: T) => number> {
  return keys.map((key) => (d: T) => Number(d[key]));
}

/**
 * Creates cumulative y-accessors for stacked line mode.
 * Each accessor returns the sum of all values up to and including its index.
 *
 * @param keys - Array of data property keys
 * @returns Array of cumulative accessor functions
 *
 * @example
 * ```typescript
 * const accessors = createCumulativeYAccessors<DataPoint>(['value1', 'value2', 'value3']);
 * // accessors[0](data) returns data.value1
 * // accessors[1](data) returns data.value1 + data.value2
 * // accessors[2](data) returns data.value1 + data.value2 + data.value3
 * ```
 */
export function createCumulativeYAccessors<T extends Record<string, unknown>>(
  keys: string[]
): Array<(d: T) => number> {
  return keys.map((_, index) => (d: T) => {
    let sum = 0;
    for (let i = 0; i <= index; i++) {
      sum += Number(d[keys[i]]) || 0;
    }
    return sum;
  });
}

/**
 * Creates a simple y-accessor for a single key.
 *
 * @param key - The data property key
 * @returns Accessor function
 */
export function createYAccessor<T extends Record<string, unknown>>(
  key: string
): (d: T) => number {
  return (d: T) => Number(d[key]);
}
