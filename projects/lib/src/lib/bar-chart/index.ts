/**
 * Bar Chart Module - Public Exports
 *
 * Tree-shakable exports for the bar chart component and utilities.
 *
 * Usage:
 * ```typescript
 * // Import only the component
 * import { BarChartComponent } from 'angular-chrts/bar-chart';
 *
 * // Import specific utilities (tree-shakable)
 * import { buildGroupedBarConfig, buildStackedBarConfig } from 'angular-chrts/bar-chart/config';
 * import { createYAccessors } from 'angular-chrts/bar-chart/utils';
 * import type { BarStructuralSignature, ValueLabel } from 'angular-chrts/bar-chart/types';
 * ```
 */

// Main component export
export { BarChartComponent } from './bar-chart.component';

// Type exports (erased at compile time, no bundle impact)
export type {
  ValueLabel,
  BarStructuralSignature,
  BarConfig,
  BarConfigOptions,
  BarXAxisConfigOptions,
  BarYAxisConfigOptions,
} from './types';

// Config builder exports (tree-shakable)
export {
  buildGroupedBarConfig,
  buildStackedBarConfig,
  buildBarXAxisConfig,
  buildBarYAxisConfig,
  buildBarContainerConfig,
} from './config';

// Utility exports (tree-shakable)
export {
  createYAccessors,
  extractBarColors,
  extractBarLegendItems,
  createTickFormatter,
} from './utils';

// State management exports (tree-shakable)
export {
  createBarStructuralSignature,
  hasBarSignatureChanged,
} from './state';
