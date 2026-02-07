/**
 * Bar Chart Utilities
 *
 * Pure functions for bar chart data processing.
 * Re-exports shared utilities for backward compatibility.
 */

// Re-export shared utilities for bar-specific usage
export {
  createYAccessors,
  extractColors as extractBarColors,
  extractLegendItems as extractBarLegendItems,
  createTickFormatter,
} from '../../utils/shared';
