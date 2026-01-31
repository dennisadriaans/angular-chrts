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
import { LegendPosition, BulletLegendItemInterface } from '../types/index';
import { TooltipComponent } from '../tooltip/index';
import { isBrowser } from '../utils/index';

// Cached date formatter instance for better performance (SSR-safe)
const getDateFormatter = () => {
  if (!isBrowser()) return (date: number | Date) => String(date);
  const formatter = new Intl.DateTimeFormat();
  return (date: number | Date) => formatter.format(typeof date === 'number' ? date : date.getTime());
};

@Component({
  selector: 'ngx-gantt-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-gantt-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
    >
      <!-- Chart container managed by unovis/ts -->
      <div #chartContainer class="ngx-gantt-chart-container" (wheel)="onScroll($event)"></div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-gantt-chart-legend"
          [style.display]="'flex'"
          [style.justifyContent]="legendAlignment()"
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
export class GanttChartComponent<T extends Record<string, any>> implements OnDestroy {
  /** The data to be displayed in the gantt chart. */
  readonly data = input.required<T[]>();

  /** The height of the chart in pixels. */
  readonly height = input<number>();

  /** Configuration for each category mapping to the items. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** Function to retrieve the start value for a task. */
  readonly x = input.required<(d: T) => number>();

  /** Function to retrieve the duration/length for a task. */
  readonly length = input.required<(d: T) => number>();

  /** Function to retrieve the type/category of the timeline item (for coloring). */
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

  /** Event emitted when a timeline item is clicked. */
  readonly clickEvent = output<{ event: MouseEvent; data: { index: number; item: T } }>();

  /** Event emitted on scroll activity. */
  readonly scrollEvent = output<number>();

  /** Event emitted when a label is hovered. */
  readonly labelHover = output<T | undefined>();

  // Template refs
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // State
  readonly slotValue = signal<T | undefined>(undefined);

  // Unovis instances
  private container: XYContainer<T> | null = null;
  private timeline: Timeline<T> | null = null;
  private xAxisComponent: Axis<T> | null = null;
  private tooltip: Tooltip | null = null;
  private legend: BulletLegend | null = null;

  // Injected services
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Computed values
  readonly isLegendTop = computed(() => this.legendPosition().startsWith('top'));

  readonly legendAlignment = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  readonly legendItems = computed(() => {
    return Object.values(this.categories()).map((item) => ({
      ...item,
      color: Array.isArray(item.color) ? item.color[0] : item.color,
    }));
  });

  readonly colors = computed(() => {
    const cats = this.categories();
    const defaultColors = Object.values(cats).map((_, index) => `var(--vis-color${index})`);
    return Object.values(cats).map((c, i) => {
      const color = c.color ?? defaultColors[i];
      return Array.isArray(color) ? color[0] : color;
    });
  });

  constructor() {
    // Initialize chart after view is ready (browser only)
    effect(() => {
      const container = this.chartContainer();
      const data = this.data();
      const categories = this.categories();

      if (!isPlatformBrowser(this.platformId) || !container?.nativeElement) {
        return;
      }

      if (!this.container) {
        this.initializeChart(container.nativeElement, data);
      } else {
        this.updateChart(data);
      }
    });

    // Update legend when items change
    effect(() => {
      const legendContainer = this.legendContainer();
      const items = this.legendItems();
      const hideLegend = this.hideLegend();

      if (!isPlatformBrowser(this.platformId) || hideLegend || !legendContainer?.nativeElement) {
        return;
      }

      this.updateLegend(legendContainer.nativeElement, items);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => this.destroyChart());
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private initializeChart(element: HTMLElement, data: T[]): void {
    const colors = this.colors();

    // Create timeline component
    this.timeline = new Timeline<T>({
      x: this.x(),
      length: this.length(),
      lineWidth: this.lineWidth(),
      rowHeight: this.rowHeight(),
      type: this.type(),
      color: colors,
      labelWidth: this.labelWidth(),
      showLabels: this.showLabels(),
    });

    // Create axis
    this.xAxisComponent = new Axis<T>({
      type: 'x',
      position: Position.Bottom,
      tickFormat: this.tickFormatFn,
      numTicks: this.xNumTicks(),
      tickLine: this.xTickLine(),
      gridLine: this.xGridLine(),
      domainLine: this.xDomainLine(),
    });

    // Create tooltip
    if (!this.hideTooltip()) {
      this.tooltip = new Tooltip({
        triggers: {
          [Timeline.selectors.label]: (d: T) => this.getTooltipContent(d),
        },
      });
    }

    // Collect drawable components (axis is managed by XYContainer)
    const components = [this.timeline];

    // Create container
    this.container = new XYContainer<T>(
      element,
      {
        height: this.height(),
        components,
        xAxis: this.xAxisComponent,
        tooltip: this.tooltip ?? undefined,
      },
      data,
    );
  }

  private updateChart(data: T[]): void {
    if (!this.container || !this.timeline) return;

    const colors = this.colors();

    // Update timeline config
    this.timeline.setConfig({
      x: this.x(),
      length: this.length(),
      lineWidth: this.lineWidth(),
      rowHeight: this.rowHeight(),
      type: this.type(),
      color: colors,
      labelWidth: this.labelWidth(),
      showLabels: this.showLabels(),
    });

    // Update axis
    if (this.xAxisComponent) {
      this.xAxisComponent.setConfig({
        type: 'x',
        position: Position.Bottom,
        tickFormat: this.tickFormatFn,
        numTicks: this.xNumTicks(),
        tickLine: this.xTickLine(),
        gridLine: this.xGridLine(),
        domainLine: this.xDomainLine(),
      });
    }

    // Update container (Unovis expects a full config; otherwise DOM children are cleared)
    this.container.updateContainer({
      height: this.height(),
      components: this.timeline ? [this.timeline] : [],
      xAxis: this.xAxisComponent ?? undefined,
      tooltip: this.tooltip ?? undefined,
    });

    this.container.setData(data);
  }

  private updateLegend(element: HTMLElement, items: BulletLegendItemInterface[]): void {
    if (!this.legend) {
      this.legend = new BulletLegend(element, { items });
    } else {
      this.legend.update({ items });
    }
  }

  private destroyChart(): void {
    this.container?.destroy();
    this.legend?.destroy();
    this.container = null;
    this.timeline = null;
    this.xAxisComponent = null;
    this.tooltip = null;
    this.legend = null;
  }

  private getTooltipContent(d: T): string {
    this.slotValue.set(d);
    this.labelHover.emit(d);
    this.cdr.detectChanges();
    return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }

  private tickFormatFn = (tick: number | Date, i: number, ticks: (number | Date)[]): string => {
    const formatter = this.xTickFormat();
    if (formatter) return formatter(tick, i, ticks);
    return getDateFormatter()(tick);
  };

  onScroll(event: WheelEvent): void {
    this.scrollEvent.emit(event.deltaY);
  }
}
