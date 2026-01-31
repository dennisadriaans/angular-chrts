/**
 * Tooltip Module - Public API
 *
 * Tree-shakable exports for the tooltip component and utilities.
 */

// Component
export { TooltipComponent } from './tooltip.component';

// Types
export {
  type TooltipStyles,
  type TooltipEntry,
  TOOLTIP_BLOCKLIST_KEYS,
} from './types';

// Utilities
export {
  extractVisibleEntries,
  getCategoryColor,
  createTooltipStyles,
  createDotStyle,
} from './utils';
