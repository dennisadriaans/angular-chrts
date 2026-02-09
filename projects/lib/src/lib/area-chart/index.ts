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
