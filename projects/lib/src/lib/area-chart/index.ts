/**
 * Area Chart Module - Public Exports
 *
 * Tree-shakable exports for the area chart component and utilities.
 *
 * Usage:
 * ```typescript
 * // Import only the component
 * import { AreaChartComponent } from 'angular-chrts/area-chart';
 *
 * // Import specific utilities (tree-shakable)
 * import { buildAreaConfig, buildLineConfig } from 'angular-chrts/area-chart/config';
 * import { createStackedYAccessors } from 'angular-chrts/area-chart/utils';
 * import type { SeriesDescriptor } from 'angular-chrts/area-chart/types';
 * ```
 */

// Main component export
export { AreaChartComponent } from './area-chart.component';

// Type exports (erased at compile time, no bundle impact)
export type {
  SeriesDescriptor,
  StructuralSignature,
  AreaConfig,
  LineConfig,
  AreaConfigOptions,
  LineConfigOptions,
  XAxisConfigOptions,
  YAxisConfigOptions,
  GradientStop,
} from './types';

// Config builder exports (tree-shakable)
export {
  buildAreaConfig,
  buildLineConfig,
  buildXAxisConfig,
  buildYAxisConfig,
  buildContainerConfig,
  DEFAULT_AREA_OPACITY,
  DEFAULT_CURVE_TYPE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_LINE_CURVE_TYPE,
} from './config';

// Utility exports (tree-shakable)
export {
  createStackedYAccessors,
  createCumulativeYAccessors,
  createYAccessor,
  getGradientId,
  generateGradientDefs,
  generateMarkerCssVars,
  createSeriesDescriptors,
  extractColors,
  extractLegendItems,
} from './utils';

// State management exports (tree-shakable)
export {
  createStructuralSignature,
  hasSignatureChanged,
  getSignatureKey,
} from './state';
