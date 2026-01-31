/**
 * Gantt Chart Component
 *
 * A configurable gantt/timeline chart component built on Unovis.
 * Displays tasks, events, or activities on a timeline with categories.
 *
 * SOLID Principles Applied:
 * - SRP: Component only orchestrates, delegates to pure functions
 * - OCP: Extended via configuration, not modification
 * - DIP: Depends on abstractions (config builders) not concrete implementations
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { XYContainer, Timeline, Axis, Tooltip, BulletLegend, Position } from '@unovis/ts';

import { LegendPosition, type BulletLegendItemInterface } from '../types';
import { TooltipComponent } from '../tooltip/index';

import type { GanttStructuralSignature } from './types';
import { buildTimelineConfig, buildGanttXAxisConfig, buildGanttContainerConfig } from './config';
import {
  extractGanttColors,
  extractGanttLegendItems,
  createGanttTickFormatter,
} from './utils';
import {
  createGanttStructuralSignature,
  hasGanttSignatureChanged,
} from './state';

@Component({
  selector: 'ngx-gantt-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-gantt-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="legendOnTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
    >
      <!-- Chart container managed by unovis/ts -->
      <div #chartContainer class="ngx-gantt-chart-container" (wheel)="onScroll($event)"></div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-gantt-chart-legend"
          [style.display]="'flex'"
          [style.justifyContent]="legendAlign()"
        ></div>
      }

      <!-- Hidden tooltip template -->
      <div #tooltipWrapper style="display: none">
        @if (slotValue()) {
          <ngx-tooltip
            [data]="slotValue()!"
            [categories]="categories()"
            [titleFormatter]="tooltipTitleFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GanttChartComponent<T extends Record<string, unknown>> implements OnDestroy {
  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** The data to be displayed in the gantt chart. */
  readonly data = input.required<T[]>();

  /** The height of the chart in pixels. */
  readonly height = input<number>();

  /** Configuration for each category mapping to the items. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** Function to retrieve the start value for a task. */
  readonly x = input.required<(d: T) => number>();

  /** Function to retrieve the duration/length for a task. */
  readonly length = input.required<(d: T) => number>();

  /** Function to retrieve the type/category of the timeline item. */
  readonly type = input.required<(d: T) => string>();

  /** Width of the labels column on the left. Default is 220. */
  readonly labelWidth = input<number>(220);

  /** Optional title for the chart. */
  readonly title = input<string>('');

  /** Whether to show labels on the timeline. */
  readonly showLabels = input<boolean>(true);

  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);

  /** Thickness of the timeline bars. Default is 12. */
  readonly lineWidth = input<number>(12);

  /** Height of each row in the chart. Default is 24. */
  readonly rowHeight = input<number>(24);

  /** Position of the legend. Default is TopRight. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.TopRight);

  /** Custom styles for the legend. */
  readonly legendStyle = input<Record<string, string>>();

  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Number of ticks on the X axis. */
  readonly xNumTicks = input<number>();

  /** Whether to show tick lines on the X axis. */
  readonly xTickLine = input<boolean>();

  /** Formatter for X axis tick labels. */
  readonly xTickFormat = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();

  /** Whether to show grid lines on the X axis. */
  readonly xGridLine = input<boolean>();

  /** Whether to show domain line on the X axis. */
  readonly xDomainLine = input<boolean>();

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Event emitted when a timeline item is clicked. */
  readonly clickEvent = output<{ event: MouseEvent; data: { index: number; item: T } }>();

  /** Event emitted on scroll activity. */
  readonly scrollEvent = output<number>();

  /** Event emitted when a label is hovered. */
  readonly labelHover = output<T | undefined>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Template References
  // ─────────────────────────────────────────────────────────────────────────────

  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  readonly slotValue = signal<T | undefined>(undefined);
  private structuralSignature: GanttStructuralSignature | null = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Unovis Instances
  // ─────────────────────────────────────────────────────────────────────────────

  private container: XYContainer<T> | null = null;
  private timeline: Timeline<T> | null = null;
  private xAxisComponent: Axis<T> | null = null;
  private tooltip: Tooltip | null = null;
  private legend: BulletLegend | null = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Injected Services
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether legend should be positioned at top */
  readonly legendOnTop = computed(() => this.legendPosition().startsWith('top'));

  /** CSS alignment for legend container */
  readonly legendAlign = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  /** Extracted colors from categories */
  readonly colors = computed(() => extractGanttColors(this.categories()));

  /** Normalized legend items */
  readonly legendItems = computed(() => extractGanttLegendItems(this.categories()));

  /** Tick format function with date formatter fallback */
  readonly tickFormatFn = computed(() => createGanttTickFormatter(this.xTickFormat()));

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    // Main chart synchronization effect
    effect(() => {
      const container = this.chartContainer();
      const data = this.data();
      // Track all inputs that affect rendering
      this.categories();
      this.x();
      this.length();
      this.type();
      this.lineWidth();
      this.rowHeight();
      this.labelWidth();
      this.showLabels();
      this.height();
      this.hideTooltip();
      this.xNumTicks();
      this.xTickLine();
      this.xGridLine();
      this.xDomainLine();

      if (!isPlatformBrowser(this.platformId) || !container?.nativeElement) {
        return;
      }

      this.syncChart(container.nativeElement, data);
    });

    // Legend synchronization effect
    effect(() => {
      const legendContainer = this.legendContainer();
      const items = this.legendItems();
      const hideLegend = this.hideLegend();

      if (!isPlatformBrowser(this.platformId) || hideLegend || !legendContainer?.nativeElement) {
        return;
      }

      this.syncLegend(legendContainer.nativeElement, items);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => this.destroyChart());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.destroyChart();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  onScroll(event: WheelEvent): void {
    this.scrollEvent.emit(event.deltaY);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods - Chart Synchronization
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Synchronizes the chart state with current inputs.
   */
  private syncChart(element: HTMLElement, data: T[]): void {
    const currentSignature = createGanttStructuralSignature(
      this.categories(),
      this.hideTooltip(),
      this.hideLegend()
    );

    const needsRebuild = hasGanttSignatureChanged(
      this.structuralSignature,
      currentSignature
    );

    if (needsRebuild) {
      this.rebuildChart(element, data);
      this.structuralSignature = currentSignature;
    } else {
      this.updateChart(data);
    }
  }

  /**
   * Completely rebuilds the chart from scratch.
   */
  private rebuildChart(element: HTMLElement, data: T[]): void {
    this.destroyChart();

    const timelineConfig = buildTimelineConfig<T>({
      x: this.x(),
      length: this.length(),
      type: this.type(),
      colors: this.colors(),
      lineWidth: this.lineWidth(),
      rowHeight: this.rowHeight(),
      labelWidth: this.labelWidth(),
      showLabels: this.showLabels(),
    });

    this.timeline = new Timeline<T>(timelineConfig);

    const axisConfig = buildGanttXAxisConfig<T>({
      tickFormat: this.tickFormatFn(),
      numTicks: this.xNumTicks(),
      tickLine: this.xTickLine(),
      gridLine: this.xGridLine(),
      domainLine: this.xDomainLine(),
      position: Position.Bottom,
    });

    this.xAxisComponent = new Axis<T>(axisConfig);

    if (!this.hideTooltip()) {
      this.tooltip = new Tooltip({
        triggers: {
          [Timeline.selectors.label]: (d: T) => this.getTooltipContent(d),
        },
      });
    }

    const containerConfig = buildGanttContainerConfig<T>({
      height: this.height(),
    });

    this.container = new XYContainer<T>(
      element,
      {
        ...containerConfig,
        components: [this.timeline],
        xAxis: this.xAxisComponent,
        tooltip: this.tooltip ?? undefined,
      },
      data
    );
  }

  /**
   * Updates existing chart components with new configuration.
   */
  private updateChart(data: T[]): void {
    if (!this.container || !this.timeline) return;

    const timelineConfig = buildTimelineConfig<T>({
      x: this.x(),
      length: this.length(),
      type: this.type(),
      colors: this.colors(),
      lineWidth: this.lineWidth(),
      rowHeight: this.rowHeight(),
      labelWidth: this.labelWidth(),
      showLabels: this.showLabels(),
    });

    this.timeline.setConfig(timelineConfig);

    if (this.xAxisComponent) {
      const axisConfig = buildGanttXAxisConfig<T>({
        tickFormat: this.tickFormatFn(),
        numTicks: this.xNumTicks(),
        tickLine: this.xTickLine(),
        gridLine: this.xGridLine(),
        domainLine: this.xDomainLine(),
        position: Position.Bottom,
      });

      this.xAxisComponent.setConfig(axisConfig);
    }

    const containerConfig = buildGanttContainerConfig<T>({
      height: this.height(),
    });

    this.container.updateContainer({
      ...containerConfig,
      components: this.timeline ? [this.timeline] : [],
      xAxis: this.xAxisComponent ?? undefined,
      tooltip: this.tooltip ?? undefined,
    });

    this.container.setData(data);
  }

  /**
   * Synchronizes the legend with current items.
   */
  private syncLegend(element: HTMLElement, items: BulletLegendItemInterface[]): void {
    if (!this.legend) {
      this.legend = new BulletLegend(element, { items });
    } else {
      this.legend.update({ items });
    }
  }

  /**
   * Destroys all chart components and cleans up resources.
   */
  private destroyChart(): void {
    this.container?.destroy();
    this.legend?.destroy();
    this.container = null;
    this.timeline = null;
    this.xAxisComponent = null;
    this.tooltip = null;
    this.legend = null;
  }

  /**
   * Generates tooltip HTML content for a hovered item.
   */
  private getTooltipContent(d: T): string {
    this.slotValue.set(d);
    this.labelHover.emit(d);
    this.cdr.detectChanges();
    return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }
}
