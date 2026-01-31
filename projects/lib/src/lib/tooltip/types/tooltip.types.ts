/**
 * Tooltip Types
 *
 * Type definitions for the tooltip component.
 */

/**
 * Configuration for tooltip display styles.
 */
export interface TooltipStyles {
  container: Record<string, string>;
  title: Record<string, string>;
  content: Record<string, string>;
  label: Record<string, string>;
  value: Record<string, string>;
}

/**
 * Represents a single visible entry in the tooltip.
 */
export interface TooltipEntry {
  key: string;
  value: unknown;
}

/**
 * Keys that should be filtered out from tooltip data.
 */
export const TOOLTIP_BLOCKLIST_KEYS = ['_index', '_stacked', '_ending'] as const;
