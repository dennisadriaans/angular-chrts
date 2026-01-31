/**
 * Bar Chart Utilities
 *
 * Pure functions for bar chart data processing.
 * Re-exports shared utilities for backward compatibility.
 *
 * SOLID Principles:
 * - SRP: Only responsible for data utilities
 * - DRY: Uses shared utilities where possible
 */

// Re-export shared utilities for bar-specific usage
export {
  createYAccessors,
  extractColors as extractBarColors,
  extractLegendItems as extractBarLegendItems,
  createTickFormatter,
} from '../../utils/shared';
