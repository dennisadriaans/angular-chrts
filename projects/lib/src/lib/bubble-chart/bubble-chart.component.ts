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
import {
  XYContainer,
  Scatter,
  Axis,
  Tooltip,
  BulletLegend,
  Position,
  type NumericAccessor,
} from '@unovis/ts';
import { LegendPosition, BulletLegendItemInterface, AxisConfig, CrosshairConfig } from '../types/index';
import { TooltipComponent } from '../tooltip/index';
import { unwrapTooltipData } from '../utils/chart-utils';

@Component({
  selector: 'ngx-bubble-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-bubble-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
      (click)="onClick($event)"
    >
      <!-- Chart container managed by unovis/ts -->
      <div #chartContainer class="ngx-bubble-chart-container"></div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-bubble-chart-legend"
          [style.display]="'flex'"
          [style.justifyContent]="legendAlignment()"
        ></div>
      }

      <!-- Hidden tooltip template -->
      <div #tooltipWrapper style="display: none">
        @if (hoverValues()) {
          <ngx-tooltip
            [data]="hoverValues()!"
            [categories]="categories() || {}"
            [titleFormatter]="tooltipTitleFormatter()"
            [yFormatter]="yFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleChartComponent<T extends Record<string, any>> implements OnDestroy {
  /** The data to be displayed in the bubble chart. */
  readonly data = input.required<T[]>();

  /** The height of the chart in pixels. Default is 600. */
  readonly height = input<number>(600);

  /** Padding around the chart area. */
  readonly padding = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });

  /** Configuration for each category mapping to the bubbles. Keyed by category property name. */
  readonly categories = input<Record<string, BulletLegendItemInterface>>({});

  /** The data key used to categorize bubbles. */
  readonly categoryKey = input<keyof T>();

  /** Accessor function for X-axis values. */
  readonly xAccessor = input<NumericAccessor<T>>();

  /** Accessor function for Y-axis values. */
  readonly yAccessor = input<NumericAccessor<T>>();

  /** Accessor function for bubble size. */
  readonly sizeAccessor = input<NumericAccessor<T>>();

  /** Position of labels relative to bubbles. */
  readonly labelPosition = input<Position>();

  /** Range of bubble sizes [min pixels, max pixels]. */
  readonly sizeRange = input<[number, number]>();

  /** Label for the X axis. */
  readonly xLabel = input<string>('');

  /** Label for the Y axis. */
  readonly yLabel = input<string>('');

  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();

  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();

  /** Number of ticks on the X axis. */
  readonly xNumTicks = input<number>();

  /** Number of ticks on the Y axis. */
  readonly yNumTicks = input<number>();

  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();

  /** If true, only shows the first and last tick labels on the X axis. */
  readonly minMaxTicksOnly = input<boolean>(false);

  /** Whether to hide the X axis entirely. */
  readonly hideXAxis = input<boolean>(false);

  /** Whether to hide the Y axis entirely. */
  readonly hideYAxis = input<boolean>(false);

  /** Whether to show grid lines for the X axis. */
  readonly xGridLine = input<boolean>(false);

  /** Whether to show grid lines for the Y axis. */
  readonly yGridLine = input<boolean>(true);

  /** Whether to show the domain line for the X axis. */
  readonly xDomainLine = input<boolean>(true);

  /** Whether to show the domain line for the Y axis. */
  readonly yDomainLine = input<boolean>(true);

  /** Whether to show tick lines for the X axis. */
  readonly xTickLine = input<boolean>(true);

  /** Whether to show tick lines for the Y axis. */
  readonly yTickLine = input<boolean>(true);

  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);

  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Position of the legend relative to the chart. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);

  /** Custom styles for the legend. */
  readonly legendStyle = input<Record<string, string>>();

  /** Crosshair configuration. */
  readonly crosshairConfig = input<CrosshairConfig>({ color: '#666' });

  /** Advanced configuration for the X axis. */
  readonly xAxisConfig = input<AxisConfig>();

  /** Advanced configuration for the Y axis. */
  readonly yAxisConfig = input<AxisConfig>();

  /** Event emitted when a bubble is clicked. */
  readonly click = output<{ event: MouseEvent; values?: T }>();

  // Template refs
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // State
  readonly hoverValues = signal<T | undefined>(undefined);

  // Unovis instances
  private container: XYContainer<T> | null = null;
  private scatter: Scatter<T> | null = null;
  private xAxisComponent: Axis<T> | null = null;
  private yAxisComponent: Axis<T> | null = null;
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
    const cats = this.categories();
    return Object.values(cats).map((item) => ({
      ...item,
      color: Array.isArray(item.color) ? item.color[0] : item.color,
    }));
  });

  readonly sizeAccessorFn = computed(() => {
    const accessor = this.sizeAccessor();
    if (accessor) return accessor;
    return (d: any) => (typeof d.comments === 'number' ? d.comments : 1);
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
    // Create scatter component
    this.scatter = new Scatter<T>({
      x: this.xAccessor(),
      y: this.yAccessor(),
      color: (d: T) => this.getColorForDatum(d),
      size: this.sizeAccessorFn(),
      labelPosition: this.labelPosition() ?? Position.Bottom,
      sizeRange: this.sizeRange() ?? [1, 20],
      cursor: 'pointer',
    });

    // Create axes
    if (!this.hideXAxis()) {
      this.xAxisComponent = new Axis<T>({
        type: 'x',
        position: Position.Bottom,
        label: this.xLabel(),
        tickFormat: this.xFormatterFn,
        gridLine: this.xGridLine(),
        domainLine: !!this.xDomainLine(),
        tickLine: this.xTickLine(),
        numTicks: this.xNumTicks(),
        tickValues: this.xExplicitTicks() as number[] | undefined,
        minMaxTicksOnly: this.minMaxTicksOnly(),
      });
    }

    if (!this.hideYAxis()) {
      this.yAxisComponent = new Axis<T>({
        type: 'y',
        label: this.yLabel(),
        tickFormat: this.yFormatterFn,
        gridLine: this.yGridLine(),
        domainLine: !!this.yDomainLine(),
        tickLine: this.yTickLine(),
        numTicks: this.yNumTicks(),
      });
    }

    // Create tooltip
    if (!this.hideTooltip()) {
      this.tooltip = new Tooltip({
        triggers: {
          [Scatter.selectors.point]: (d: T) => this.getTooltipContent(d),
        },
      });
    }

    // Collect drawable components (axes are managed by XYContainer)
    const components = [this.scatter];

    // Create container
    this.container = new XYContainer<T>(
      element,
      {
        height: this.height(),
        padding: this.padding(),
        scaleByDomain: true,
        components,
        xAxis: this.xAxisComponent ?? undefined,
        yAxis: this.yAxisComponent ?? undefined,
        tooltip: this.tooltip ?? undefined,
      },
      data,
    );
  }

  private updateChart(data: T[]): void {
    if (!this.container || !this.scatter) return;

    // Update scatter config
    this.scatter.setConfig({
      x: this.xAccessor(),
      y: this.yAccessor(),
      color: (d: T) => this.getColorForDatum(d),
      size: this.sizeAccessorFn(),
      labelPosition: this.labelPosition() ?? Position.Bottom,
      sizeRange: this.sizeRange() ?? [1, 20],
      cursor: 'pointer',
    });

    // Update axes
    if (this.xAxisComponent) {
      this.xAxisComponent.setConfig({
        type: 'x',
        position: Position.Bottom,
        label: this.xLabel(),
        tickFormat: this.xFormatterFn,
        gridLine: this.xGridLine(),
        domainLine: !!this.xDomainLine(),
        tickLine: this.xTickLine(),
        numTicks: this.xNumTicks(),
        tickValues: this.xExplicitTicks() as number[] | undefined,
        minMaxTicksOnly: this.minMaxTicksOnly(),
      });
    }

    if (this.yAxisComponent) {
      this.yAxisComponent.setConfig({
        type: 'y',
        label: this.yLabel(),
        tickFormat: this.yFormatterFn,
        gridLine: this.yGridLine(),
        domainLine: !!this.yDomainLine(),
        tickLine: this.yTickLine(),
        numTicks: this.yNumTicks(),
      });
    }

    // Update container (Unovis expects a full config; otherwise DOM children are cleared)
    this.container.updateContainer({
      height: this.height(),
      padding: this.padding(),
      scaleByDomain: true,
      components: this.scatter ? [this.scatter] : [],
      xAxis: this.xAxisComponent ?? undefined,
      yAxis: this.yAxisComponent ?? undefined,
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
    this.scatter = null;
    this.xAxisComponent = null;
    this.yAxisComponent = null;
    this.tooltip = null;
    this.legend = null;
  }

  private getColorForDatum(d: T): string | null | undefined {
    const cats = this.categories();
    const catKey = this.categoryKey();
    if (!cats || !catKey) {
      return '#cccccc';
    }

    const categoryValue = String(d[catKey as keyof T]);
    let categoryColor = cats[categoryValue]?.color;

    // Special case: when only one category is defined, use the categoryKey
    // directly as the category lookup key (matching Vue behavior)
    if (Object.keys(cats).length === 1) {
      categoryColor = cats[catKey as keyof typeof cats]?.color;
    }

    if (!categoryColor) {
      return '#cccccc';
    }

    // Ensure we return a string, not an array
    return Array.isArray(categoryColor) ? categoryColor[0] : categoryColor;
  }

  private getTooltipContent(d: any): string {
    const data = unwrapTooltipData(d, this.data());
    this.hoverValues.set(data);
    this.cdr.detectChanges();
    return data ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }

  private xFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]): string => {
    const formatter = this.xFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  private yFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]): string => {
    const formatter = this.yFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }
}
