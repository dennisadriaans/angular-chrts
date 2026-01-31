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
  Area,
  Line,
  Axis,
  Crosshair,
  Tooltip,
  BulletLegend,
  CurveType,
  Position,
} from '@unovis/ts';
import { BulletLegendItemInterface, LegendPosition } from '../types/legend';
import { MarkerConfig } from '../types/common';
import { AxisFormatter as axisFormatter } from '../types/axis';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { createMarkers } from '../utils/index';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-area-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
      [style]="markerCssVars()"
      [class.stacked-area-chart]="stacked()"
      [attr.id]="markerConfig()?.id"
      (click)="onClick($event)"
    >
      <svg width="0" height="0" style="position: absolute" aria-hidden="true">
        <defs [innerHTML]="svgDefs()"></defs>
        <defs [innerHTML]="markerSvgDefs()"></defs>
      </svg>

      <!-- Chart container managed by unovis/ts -->
      <div #chartContainer class="ngx-area-chart-container"></div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-area-chart-legend"
          [style.display]="'flex'"
          [style.justifyContent]="legendAlignment()"
        ></div>
      }

      <!-- Hidden tooltip template -->
      <div #tooltipWrapper style="display: none">
        @if (hoverValues()) {
          <ngx-tooltip
            [data]="hoverValues()!"
            [categories]="categories()"
            [titleFormatter]="tooltipTitleFormatter()"
            [yFormatter]="yFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaChartComponent<T extends Record<string, any>> implements OnDestroy {
  // ===== DATA INPUTS =====
  /** The data to be displayed in the chart. */
  readonly data = input.required<T[]>();

  /** Configuration for each category (line/area) in the chart. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  // ===== CHART APPEARANCE =====
  /** The height of the chart in pixels. Default is 400. */
  readonly height = input<number>(400);

  /** Padding around the chart area. */
  readonly padding = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 30,
    left: 40,
  });

  /** Whether to stack the areas on top of each other. */
  readonly stacked = input<boolean>(false);

  /** Whether to hide the filled area and only show lines. */
  readonly hideArea = input<boolean>(false);

  // ===== LINE STYLING =====
  /** The type of curve to use for the lines/areas. */
  readonly curveType = input<CurveType>();

  /** Thickness of the lines. Default is 2. */
  readonly lineWidth = input<number>(2);

  /** Array of dash patterns for each line. */
  readonly lineDashArray = input<number[][]>();

  /** Configuration for svg markers (dots) on the lines. */
  readonly markerConfig = input<MarkerConfig>();

  /** Gradient stop configuration for area charts. */
  readonly gradientStops = input<Array<{ offset: string; stopOpacity: number }>>([
    { offset: '0%', stopOpacity: 1 },
    { offset: '75%', stopOpacity: 0 },
  ]);

  // ===== AXIS CONFIGURATION =====
  /** Label for the X axis. */
  readonly xLabel = input<string>();

  /** Label for the Y axis. */
  readonly yLabel = input<string>();

  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<axisFormatter>();

  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<axisFormatter>();

  /** Number of ticks to show on the X axis. */
  readonly xNumTicks = input<number>();

  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();
  readonly xExplicitTicksValues = computed(() => this.xExplicitTicks() as number[] | undefined);

  /** If true, only shows the first and last tick labels on the X axis. */
  readonly minMaxTicksOnly = input<boolean>(false);

  /** Number of ticks to show on the Y axis. */
  readonly yNumTicks = input<number>();

  /** Manual Y domain [min, max]. */
  readonly yDomain = input<[number, number]>();

  /** Manual X domain [min, max]. */
  readonly xDomain = input<[number, number]>();

  // ===== AXIS VISIBILITY =====
  /** Whether to hide the X axis entirely. */
  readonly hideXAxis = input<boolean>(false);

  /** Whether to hide the Y axis entirely. */
  readonly hideYAxis = input<boolean>(false);

  /** Whether to show grid lines for the X axis. */
  readonly xGridLine = input<boolean>(false);

  /** Whether to show grid lines for the Y axis. */
  readonly yGridLine = input<boolean>(false);

  /** Whether to show the domain line for the X axis. */
  readonly xDomainLine = input<boolean>(false);

  /** Whether to show the domain line for the Y axis. */
  readonly yDomainLine = input<boolean>(false);

  /** Whether to show tick lines for the X axis. */
  readonly xTickLine = input<boolean>(false);

  /** Whether to show tick lines for the Y axis. */
  readonly yTickLine = input<boolean>(false);

  // ===== TOOLTIP CONFIGURATION =====
  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);

  /** Custom styles for the tooltip. */
  readonly tooltipStyle = input<Record<string, string>>({});

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();

  // ===== LEGEND CONFIGURATION =====
  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Position of the legend relative to the chart. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);

  /** Custom styles for the legend. */
  readonly legendStyle = input<Record<string, string>>();

  // ===== OUTPUTS =====
  /** Event emitted when the chart or a segment is clicked. */
  readonly click = output<{ event: MouseEvent; values?: T }>();

  // Constants
  private readonly DEFAULT_OPACITY = 0.5;
  private readonly DEFAULT_COLOR = '#3b82f6';

  // Injected services
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Template refs
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // State
  readonly hoverValues = signal<T | undefined>(undefined);

  // Unovis instances
  private container: XYContainer<T> | null = null;
  private areas: Area<T>[] = [];
  private lines: Line<T>[] = [];
  private xAxis: Axis<T> | null = null;
  private yAxis: Axis<T> | null = null;
  private crosshair: Crosshair<T> | null = null;
  private tooltip: Tooltip | null = null;
  private legend: BulletLegend | null = null;

  // Computed values
  readonly categoryKeys = computed(() => Object.keys(this.categories()));

  readonly colors = computed(() => {
    const cats = this.categories();
    return Object.keys(cats).map((key, index) => {
      const color = cats[key].color;
      if (Array.isArray(color)) return color[0] ?? `var(--vis-color${index})`;
      return color ?? `var(--vis-color${index})`;
    });
  });

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

  readonly svgDefs = computed(() => {
    const stops = this.gradientStops();
    const colors = this.colors();

    return colors
      .map((color, index) => {
        const id = `gradient-${index}-${color.replace(/#/g, '')}`;
        return `
        <linearGradient id="${id}" gradientTransform="rotate(90)">
          ${stops.map((stop) => `<stop offset="${stop.offset}" stop-color="${color}" stop-opacity="${stop.stopOpacity}" />`).join('')}
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </linearGradient>
      `;
      })
      .join('');
  });

  readonly markerSvgDefs = computed(() => {
    const config = this.markerConfig();
    if (!config?.config) return '';
    return createMarkers(config);
  });

  readonly markerCssVars = computed(() => {
    const config = this.markerConfig();
    if (!config?.config) return {};

    const vars: Record<string, string> = {};
    for (const key of Object.keys(config.config)) {
      vars[`--vis-marker-${key}`] = `url("#${config.id}-${key}")`;
    }
    return vars;
  });

  constructor() {
    this.initializeChartEffect();
    this.initializeLegendEffect();
    this.destroyRef.onDestroy(() => this.destroyChart());
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  // ===== LIFECYCLE EFFECTS =====
  private initializeChartEffect(): void {
    // Initialize chart after view is ready (browser only)
    effect(() => {
      const container = this.chartContainer();
      const data = this.data();

      if (!isPlatformBrowser(this.platformId) || !container?.nativeElement) {
        return;
      }

      if (!this.container) {
        this.initializeChart(container.nativeElement, data);
      } else {
        this.updateChart(data);
      }
    });
  }

  private initializeLegendEffect(): void {
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
  }

  // ===== CHART INITIALIZATION =====
  private initializeChart(element: HTMLElement, data: T[]): void {
    const keys = this.categoryKeys();
    const colors = this.colors();
    const stacked = this.stacked();

    // Create components
    this.areas = [];
    this.lines = [];

    if (stacked) {
      // Stacked mode: single Area and Line with multiple y accessors
      const yAccessors = this.createStackedYAccessors(keys);
      const lineYAccessors = this.createCumulativeYAccessors(keys);

      const area = new Area<T>({
        x: (_: T, i: number) => i,
        y: yAccessors,
        color: colors, // Use array of colors for stacked
        opacity: this.hideArea() ? 0 : this.DEFAULT_OPACITY,
        curveType: this.curveType() ?? CurveType.MonotoneX,
      });
      this.areas.push(area);

      const line = new Line<T>({
        x: (_: T, i: number) => i,
        y: lineYAccessors,
        color: colors, // Use array of colors for stacked
        curveType: this.curveType() ?? CurveType.MonotoneX,
        lineWidth: this.lineWidth(),
      });
      this.lines.push(line);
    } else {
      // Non-stacked mode: separate Area and Line for each category
      this.createNonStackedComponents(keys, colors);
    }

    // Create axes
    this.createAxes();

    // Create tooltip and crosshair
    this.createTooltip();

    // Create container
    this.container = new XYContainer<T>(
      element,
      this.buildContainerConfig(),
      data,
    );
  }

  // ===== CHART UPDATE =====
  private updateChart(data: T[]): void {
    if (!this.container) return;

    const keys = this.categoryKeys();
    const colors = this.colors();
    const stacked = this.stacked();

    // Update areas and lines
    if (stacked) {
      this.updateStackedComponents(keys, colors);
    } else {
      this.updateNonStackedComponents(keys, colors);
    }

    // Update axes and container
    this.updateAxes();
    this.updateContainer(data);
  }
// ===== LEGEND & CLEANUP =====
  
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
    this.legend = null;
    this.areas = [];
    this.lines = [];
    this.xAxis = null;
    this.yAxis = null;
    this.crosshair = null;
    this.tooltip = null;
  }
// ===== EVENT HANDLERS =====
  
  private onCrosshairUpdate = (d: T): string => {
    this.hoverValues.set(d);
    this.cdr.detectChanges();
    return this.tooltipWrapper()?.nativeElement.innerHTML || '';
  };

  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }

  // ===== HELPER METHODS - ACCESSORS =====
  private createStackedYAccessors(keys: string[]): Array<(d: T) => number> {
    return keys.map((key) => (d: T) => Number(d[key]));
  }

  private createCumulativeYAccessors(keys: string[]): Array<(d: T) => number> {
    return keys.map((_, index) => (d: T) => {
      let sum = 0;
      for (let i = 0; i <= index; i++) {
        sum += Number(d[keys[i]]) || 0;
      }
      return sum;
    });
  }

  private getGradientId(index: number, color: string): string {
    return `gradient-${index}-${color.replace(/#/g, '')}`;
  }

  // ===== HELPER METHODS - COMPONENT CREATION =====
  private getDrawableComponents(): Array<Area<T> | Line<T>> {
    return [...this.areas, ...this.lines];
  }

  private buildXAxisConfig(): Record<string, unknown> {
    return {
      type: 'x',
      position: Position.Bottom,
      label: this.xLabel(),
      labelMargin: 8,
      numTicks: this.xNumTicks(),
      tickFormat: this.xFormatter(),
      tickValues: this.xExplicitTicksValues(),
      gridLine: this.xGridLine(),
      domainLine: this.xDomainLine(),
      tickLine: this.xTickLine(),
      minMaxTicksOnly: this.minMaxTicksOnly(),
    };
  }

  private buildYAxisConfig(): Record<string, unknown> {
    return {
      type: 'y',
      label: this.yLabel(),
      numTicks: this.yNumTicks(),
      tickFormat: this.yFormatter(),
      gridLine: this.yGridLine(),
      domainLine: this.yDomainLine(),
      tickLine: this.yTickLine(),
    };
  }

  private buildContainerConfig(): Record<string, unknown> {
    return {
      height: this.height(),
      padding: this.padding(),
      yDomain: this.yDomain(),
      xDomain: this.xDomain(),
      components: this.getDrawableComponents(),
      xAxis: this.xAxis ?? undefined,
      yAxis: this.yAxis ?? undefined,
      crosshair: this.crosshair ?? undefined,
      tooltip: this.tooltip ?? undefined,
    };
  }

  private createNonStackedComponents(keys: string[], colors: string[]): void {
    const lineDashArray = this.lineDashArray();

    keys.forEach((key, index) => {
      const gradientId = this.getGradientId(index, colors[index]);
      
      const area = new Area<T>({
        x: (_: T, i: number) => i,
        y: (d: T) => Number(d[key]),
        color: `url(#${gradientId})`,
        opacity: this.hideArea() ? 0 : this.DEFAULT_OPACITY,
        curveType: this.curveType() ?? CurveType.MonotoneX,
      });
      this.areas.push(area);

      const line = new Line<T>({
        x: (_: T, i: number) => i,
        y: (d: T) => Number(d[key]),
        color: colors[index],
        curveType: this.curveType() ?? CurveType.MonotoneX,
        lineWidth: this.lineWidth(),
        lineDashArray: lineDashArray?.[index],
      });
      this.lines.push(line);
    });
  }

  private createAxes(): void {
    if (!this.hideXAxis()) {
      this.xAxis = new Axis<T>(this.buildXAxisConfig());
    }

    if (!this.hideYAxis()) {
      this.yAxis = new Axis<T>(this.buildYAxisConfig());
    }
  }

  private createTooltip(): void {
    if (this.hideTooltip()) return;

    this.tooltip = new Tooltip({
      horizontalPlacement: Position.Right,
      verticalPlacement: Position.Top,
    });

    this.crosshair = new Crosshair<T>({
      template: (d: T) => this.onCrosshairUpdate(d),
    });
  }

  // ===== HELPER METHODS - COMPONENT UPDATE =====
  private updateStackedComponents(keys: string[], colors: string[]): void {
    const yAccessors = this.createStackedYAccessors(keys);
    const lineYAccessors = this.createCumulativeYAccessors(keys);

    this.areas[0]?.setConfig({
      x: (_: T, i: number) => i,
      y: yAccessors,
      color: colors,
      opacity: this.hideArea() ? 0 : this.DEFAULT_OPACITY,
      curveType: this.curveType() ?? CurveType.MonotoneX,
    });

    this.lines[0]?.setConfig({
      x: (_: T, i: number) => i,
      y: lineYAccessors,
      color: colors,
      curveType: this.curveType() ?? CurveType.MonotoneX,
      lineWidth: this.lineWidth(),
    });
  }

  private updateNonStackedComponents(keys: string[], colors: string[]): void {
    const lineDashArray = this.lineDashArray();

    keys.forEach((key, index) => {
      const gradientId = this.getGradientId(index, colors[index]);

      this.areas[index]?.setConfig({
        x: (_: T, i: number) => i,
        y: (d: T) => Number(d[key]),
        color: `url(#${gradientId})`,
        opacity: this.hideArea() ? 0 : this.DEFAULT_OPACITY,
        curveType: this.curveType() ?? CurveType.MonotoneX,
      });

      this.lines[index]?.setConfig({
        x: (_: T, i: number) => i,
        y: (d: T) => Number(d[key]),
        color: colors[index],
        curveType: this.curveType() ?? CurveType.MonotoneX,
        lineWidth: this.lineWidth(),
        lineDashArray: lineDashArray?.[index],
      });
    });
  }

  private updateAxes(): void {
    if (this.xAxis) {
      this.xAxis.setConfig(this.buildXAxisConfig());
    }

    if (this.yAxis) {
      this.yAxis.setConfig(this.buildYAxisConfig());
    }
  }

  private updateContainer(data: T[]): void {
    if (!this.container) return;

    // Unovis expects a full container config on update; otherwise defaults may wipe components/axes.
    this.container.updateContainer(this.buildContainerConfig());

    this.container.setData(data);
  }
}
