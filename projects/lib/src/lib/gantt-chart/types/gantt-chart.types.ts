import { Position } from '@unovis/ts';

/**
 * Signature of structural properties that require a full chart rebuild when changed.
 */
export interface GanttStructuralSignature {
  hideTooltip: boolean;
  hideLegend: boolean;
  categoryKeys: string;
}

/**
 * Configuration options for the Timeline component.
 */
export interface TimelineConfig<T> {
  x: (d: T) => number;
  length: (d: T) => number;
  lineWidth: number;
  rowHeight: number;
  type: (d: T) => string;
  color: string[];
  labelWidth: number;
  showLabels: boolean;
}

/**
 * Configuration options for building timeline config.
 */
export interface TimelineConfigOptions<T> {
  x: (d: T) => number;
  length: (d: T) => number;
  type: (d: T) => string;
  colors: string[];
  lineWidth: number;
  rowHeight: number;
  labelWidth: number;
  showLabels: boolean;
}

/**
 * Configuration options for the X-axis in gantt charts.
 */
export interface GanttXAxisConfigOptions {
  tickFormat?: (tick: number | Date, i?: number, ticks?: (number | Date)[]) => string;
  numTicks?: number;
  tickLine?: boolean;
  gridLine?: boolean;
  domainLine?: boolean;
  position?: Position;
}

/**
 * Configuration options for the gantt container.
 */
export interface GanttContainerConfigOptions {
  height?: number;
}
