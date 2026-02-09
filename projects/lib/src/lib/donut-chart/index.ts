// Component
export { DonutChartComponent } from './donut-chart.component';

// Types
export {
  DonutType,
  type DonutStructuralSignature,
  type DonutConfig,
  type DonutConfigOptions,
  type DonutContainerConfigOptions,
  type NormalizedLegendItem,
} from './types';

// Config Builders
export {
  buildDonutConfig,
  buildDonutContainerConfig,
  calculateAngleRange,
} from './config';

// Utilities
export {
  normalizeColor,
  extractDonutColors,
  extractDonutLegendItems,
  getLegendAlignment,
  isLegendAtTop,
} from './utils';

// State
export {
  createDonutStructuralSignature,
  hasDonutSignatureChanged,
} from './state';
