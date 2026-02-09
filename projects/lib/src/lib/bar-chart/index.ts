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
