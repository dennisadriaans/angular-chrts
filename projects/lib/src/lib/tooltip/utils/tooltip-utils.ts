import type { BulletLegendItemInterface } from '../../types';
import { TOOLTIP_BLOCKLIST_KEYS, type TooltipEntry } from '../types';

// Re-export shared utilities
export { getCategoryColor } from '../../utils/shared';

/**
 * Filters and extracts visible entries from tooltip data.
 * Excludes internal keys and keys not present in categories.
 *
 * @param data - The tooltip data object
 * @param categories - Category configuration object
 * @returns Array of visible entries
 */
export function extractVisibleEntries<T extends Record<string, any>>(
  data: T | null | undefined,
  categories: Record<string, BulletLegendItemInterface>
): TooltipEntry[] {
  if (!data) return [];

  const categoryKeys = Object.keys(categories);

  return Object.entries(data)
    .filter(
      ([key]) =>
        !TOOLTIP_BLOCKLIST_KEYS.includes(key as (typeof TOOLTIP_BLOCKLIST_KEYS)[number]) &&
        categoryKeys.includes(key)
    )
    .map(([key, value]) => ({ key, value }));
}

/**
 * Creates default tooltip styles with CSS custom properties.
 */
export function createTooltipStyles() {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '0px',
      margin: '0px',
    },
    title: {
      color: 'var(--vis-tooltip-title-color, #000)',
      textTransform: 'var(--vis-tooltip-title-text-transform, capitalize)',
      borderBottom: 'var(--vis-tooltip-title-border-bottom, 1px solid #e5e7eb)',
      padding: 'var(--vis-tooltip-title-padding, 0.75rem 0.75rem 0.5rem 0.75rem)',
      margin: 'var(--vis-tooltip-title-margin, 0 0 0.25rem 0)',
      fontSize: 'var(--vis-tooltip-title-font-size, 0.875rem)',
      lineHeight: 'var(--vis-tooltip-title-line-height, 100%)',
      fontWeight: 'var(--vis-tooltip-title-font-weight, 600)',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 'var(--vis-tooltip-content-gap, 0.25rem 0.5rem)',
      padding: 'var(--vis-tooltip-content-padding, 0 0.75rem 0.5rem 0.75rem)',
    },
    label: {
      fontWeight: 'var(--vis-tooltip-label-font-weight, 400)',
      fontSize: 'var(--vis-tooltip-label-font-size, 0.875rem)',
      color: 'var(--vis-tooltip-label-color, inherit)',
      margin: 'var(--vis-tooltip-label-margin, 0 1rem 0 0)',
      whiteSpace: 'nowrap',
    },
    value: {
      fontSize: 'var(--vis-tooltip-value-font-size, 0.875rem)',
      fontWeight: 'var(--vis-tooltip-value-font-weight, 600)',
      color: 'var(--vis-tooltip-value-color, inherit)',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
  } as const;
}

/**
 * Creates dot style for a category color.
 *
 * @param color - The color to use
 * @returns Style object for the dot
 */
export function createDotStyle(color: string): Record<string, string> {
  return {
    width: '8px',
    height: '8px',
    aspectRatio: '1',
    borderRadius: 'var(--vis-tooltip-dot-border-radius, 4px)',
    margin: 'var(--vis-tooltip-dot-margin, 0)',
    flexShrink: '0',
    backgroundColor: color,
  };
}
