/**
 * Y-Accessor Factories
 *
 * Re-exports shared accessor utilities with area-chart specific additions.
 *
 * SOLID Principles:
 * - SRP: Only responsible for accessor creation
 * - DRY: Uses shared utilities where possible
 */

// Re-export from shared utilities
export {
  createStackedYAccessors,
  createCumulativeYAccessors,
  createYAccessor,
} from '../../utils/shared';
