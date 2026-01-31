/**
 * Tooltip Component
 *
 * A configurable tooltip component for displaying chart hover data.
 * Uses CSS custom properties for theming.
 *
 * SOLID Principles Applied:
 * - SRP: Component focuses on rendering, utilities handle data processing
 * - OCP: Extended via CSS custom properties, not modification
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { BulletLegendItemInterface } from '../types';
import type { AxisFormatter } from '../types/axis';
import { getFirstPropertyValue } from '../utils/index';

import {
  extractVisibleEntries,
  getCategoryColor,
  createTooltipStyles,
  createDotStyle,
} from './utils';

/** Pre-computed styles for better performance */
const STYLES = createTooltipStyles();

@Component({
  selector: 'ngx-tooltip',
  standalone: true,
  imports: [],
  template: `
    <div [style]="containerStyle">
      @if (titleFormat()) {
        <div [style]="titleStyle">
          {{ titleFormat() }}
        </div>
      }
      <div [style]="contentStyle">
        @for (entry of visibleEntries(); track entry.key; let i = $index) {
          <span [style]="getDotStyle(entry.key, i)"></span>
          <span [style]="labelStyle">
            {{ categories()[entry.key].name }}
          </span>
          <span [style]="valueStyle">
            {{ formatValue(entry.value, i) }}
          </span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent<T extends Record<string, unknown>> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** The data object representing current hover state. */
  readonly data = input.required<T>();

  /** Legend configuration mapping keys to labels. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** Optional formatter for the tooltip title. */
  readonly titleFormatter = input<(data: T) => string | number>();

  /** Optional formatter for the values. */
  readonly yFormatter = input<AxisFormatter>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────────

  readonly titleFormat = computed(() => {
    const data = this.data();
    const formatter = this.titleFormatter();
    if (formatter) return formatter(data);
    return getFirstPropertyValue(data);
  });

  readonly visibleEntries = computed(() =>
    extractVisibleEntries(this.data(), this.categories())
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Styles (static, pre-computed)
  // ─────────────────────────────────────────────────────────────────────────────

  readonly containerStyle = STYLES.container;
  readonly titleStyle = STYLES.title;
  readonly contentStyle = STYLES.content;
  readonly labelStyle = STYLES.label;
  readonly valueStyle = STYLES.value;

  // ─────────────────────────────────────────────────────────────────────────────
  // Methods
  // ─────────────────────────────────────────────────────────────────────────────

  getDotStyle(key: string, index: number): Record<string, string> {
    const color = getCategoryColor(this.categories()[key], index);
    return createDotStyle(color);
  }

  /**
   * Formats a value using the yFormatter if available.
   */
  formatValue(value: unknown, index: number): string | unknown {
    const formatter = this.yFormatter();
    if (formatter && (typeof value === 'number' || value instanceof Date)) {
      return formatter(value, index, []);
    }
    return value;
  }
}
