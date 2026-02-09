// Re-export shared utilities for gantt-specific usage
export {
  extractColors as extractGanttColors,
  extractLegendItems as extractGanttLegendItems,
  createDateFormatter,
  createDateTickFormatter as createGanttTickFormatter,
} from '../../utils/shared';
