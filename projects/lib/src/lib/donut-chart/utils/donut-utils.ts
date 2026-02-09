/**
 * Donut Chart Utilities
 *
 * Pure functions for donut chart data processing.
 * Re-exports shared utilities for backward compatibility.
 */

// Re-export shared utilities for donut-specific usage
export {
  normalizeColor,
  extractColors as extractDonutColors,
  extractLegendItems as extractDonutLegendItems,
  getLegendAlignment,
  isLegendAtTop,
  type NormalizedLegendItem,
} from '../../utils/shared';
