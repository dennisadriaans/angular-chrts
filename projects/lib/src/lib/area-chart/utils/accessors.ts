/**
 * Y-Accessor Factories
 *
 * Pure functions for creating y-accessor functions for stacked and non-stacked modes.
 *
 * SOLID Principles:
 * - SRP: Only responsible for accessor creation
 * - OCP: New accessor types can be added without modifying existing code
 */

/**
 * Creates y-accessors for stacked area mode.
 * Each accessor returns the raw value for its key.
 *
 * @param keys - Array of data property keys
 * @returns Array of accessor functions
 *
 * @example
 * ```typescript
 * const accessors = createStackedYAccessors<DataPoint>(['value1', 'value2']);
 * // accessors[0](data) returns data.value1
 * // accessors[1](data) returns data.value2
 * ```
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
 *
 * @example
 * ```typescript
 * const accessor = createYAccessor<DataPoint>('value');
 * // accessor(data) returns data.value
 * ```
 */
export function createYAccessor<T extends Record<string, unknown>>(
  key: string
): (d: T) => number {
  return (d: T) => Number(d[key]);
}
