/**
 * Gantt Chart Module - Public API
 *
 * Tree-shakable exports for the gantt chart component and utilities.
 */

// Component
export { GanttChartComponent } from './gantt-chart.component';

// Types
export {
  type GanttStructuralSignature,
  type TimelineConfig,
  type TimelineConfigOptions,
  type GanttXAxisConfigOptions,
  type GanttContainerConfigOptions,
} from './types';

// Config Builders
export {
  buildTimelineConfig,
  buildGanttXAxisConfig,
  buildGanttContainerConfig,
} from './config';

// Utilities
export {
  createDateFormatter,
  extractGanttColors,
  extractGanttLegendItems,
  createGanttTickFormatter,
} from './utils';

// State
export {
  createGanttStructuralSignature,
  hasGanttSignatureChanged,
} from './state';
