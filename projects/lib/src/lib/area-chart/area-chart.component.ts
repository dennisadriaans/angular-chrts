/**
 * Area Chart Component
 *
 * A flexible area chart component that wraps Unovis for Angular applications.
 * Supports both stacked and non-stacked modes with full customization.
 *
 * SOLID Principles Applied:
 * - SRP: Component focuses on Angular integration and template rendering
 * - OCP: Config builders allow extension without modification
 * - DIP: Depends on abstracted config builders and utilities
 *
 * Architecture:
 * - Types: ./types/ - All TypeScript interfaces
 * - Config: ./config/ - Pure config builder functions
 * - Utils: ./utils/ - Pure utility functions
 * - State: ./state/ - State management utilities
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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

// Shared library types
import { BulletLegendItemInterface, LegendPosition } from '../types/legend';
import { MarkerConfig } from '../types/common';
import { AxisFormatter as axisFormatter } from '../types/axis';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { createMarkers } from '../utils/index';

// Local extracted modules
import type { StructuralSignature, GradientStop } from './types';
import { buildAreaConfig, buildLineConfig, buildXAxisConfig, buildYAxisConfig, buildContainerConfig } from './config';
import {
  createStackedYAccessors,
  createCumulativeYAccessors,
  createSeriesDescriptors,
  extractColors,
  extractLegendItems,
  generateGradientDefs,
  generateMarkerCssVars,
} from './utils';
import { hasSignatureChanged } from './state';

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
  readonly gradientStops = input<GradientStop[]>([
    { offset: '0%', stopOpacity: 1 },
    { offset: '100%', stopOpacity: 0 },
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

  // ===== INJECTED SERVICES =====
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  // ===== TEMPLATE REFS =====
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // ===== STATE =====
  readonly hoverValues = signal<T | undefined>(undefined);
  private lastSignature: StructuralSignature | null = null;

  // ===== UNOVIS INSTANCES =====
  private container: XYContainer<T> | null = null;
  private areas: Area<T>[] = [];
  private lines: Line<T>[] = [];
  private xAxis: Axis<T> | null = null;
  private yAxis: Axis<T> | null = null;
  private crosshair: Crosshair<T> | null = null;
  private tooltip: Tooltip | null = null;
  private legend: BulletLegend | null = null;

  // ===== COMPUTED VALUES =====
  readonly categoryKeys = computed(() => Object.keys(this.categories()));

  readonly colors = computed(() => extractColors(this.categories()));

  readonly isLegendTop = computed(() => this.legendPosition().startsWith('top'));

  readonly legendAlignment = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  readonly legendItems = computed(() => extractLegendItems(this.categories()));

  readonly series = computed(() =>
    createSeriesDescriptors(this.categoryKeys(), this.colors(), this.lineDashArray())
  );

  readonly structuralSignature = computed((): StructuralSignature => ({
    stacked: this.stacked(),
    categoryKeys: this.categoryKeys().join(','),
    hideXAxis: this.hideXAxis(),
    hideYAxis: this.hideYAxis(),
    hideTooltip: this.hideTooltip(),
  }));

  readonly svgDefs = computed(() => {
    const defs = generateGradientDefs(this.colors(), this.gradientStops());
    return this.sanitizer.bypassSecurityTrustHtml(defs);
  });

  readonly markerSvgDefs = computed(() => {
    const config = this.markerConfig();
    if (!config?.config) return this.sanitizer.bypassSecurityTrustHtml('');
    return this.sanitizer.bypassSecurityTrustHtml(createMarkers(config));
  });

  readonly markerCssVars = computed(() => generateMarkerCssVars(this.markerConfig()));

  // ===== CONSTRUCTOR =====
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
    effect(() => {
      const container = this.chartContainer();
      const data = this.data();
      const signature = this.structuralSignature();

      if (!isPlatformBrowser(this.platformId) || !container?.nativeElement) {
        return;
      }

      this.syncChart(container.nativeElement, data, signature);
    });
  }

  private initializeLegendEffect(): void {
    effect(() => {
      const legendContainer = this.legendContainer();
      const items = this.legendItems();
      const hideLegend = this.hideLegend();

      if (!isPlatformBrowser(this.platformId)) return;

      if (hideLegend) {
        this.legend?.destroy();
        this.legend = null;
        return;
      }

      if (!legendContainer?.nativeElement) return;

      this.updateLegend(legendContainer.nativeElement, items);
    });
  }

  // ===== CHART SYNC =====
  private syncChart(element: HTMLElement, data: T[], signature: StructuralSignature): void {
    const needsRebuild = hasSignatureChanged(signature, this.lastSignature);

    if (!this.container) {
      this.initializeChart(element, data);
      this.lastSignature = signature;
    } else if (needsRebuild) {
      this.destroyChart();
      this.initializeChart(element, data);
      this.lastSignature = signature;
    } else {
      this.updateChart(data);
    }
  }

  // ===== CHART INITIALIZATION =====
  private initializeChart(element: HTMLElement, data: T[]): void {
    this.areas = [];
    this.lines = [];

    if (this.stacked()) {
      this.createStackedComponents();
    } else {
      this.createNonStackedComponents();
    }

    this.createAxes();
    this.createTooltip();

    this.container = new XYContainer<T>(
      element,
      this.getContainerConfig(),
      data,
    );
  }

  // ===== CHART UPDATE =====
  private updateChart(data: T[]): void {
    if (!this.container) return;

    if (this.stacked()) {
      this.updateStackedComponents();
    } else {
      this.updateNonStackedComponents();
    }

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

  // ===== COMPONENT CREATION =====
  private createNonStackedComponents(): void {
    const seriesData = this.series();
    const styleParams = this.getStyleParams();

    for (const s of seriesData) {
      const yAccessor = (d: T) => Number(d[s.key]);

      const areaConfig = buildAreaConfig<T>(
        { y: yAccessor, color: `url(#${s.gradientId})` },
        styleParams
      );
      this.areas.push(new Area<T>(areaConfig));

      const lineConfig = buildLineConfig<T>(
        { y: yAccessor, color: s.color, lineDashArray: s.lineDashArray },
        { lineWidth: this.lineWidth(), curveType: this.curveType() }
      );
      this.lines.push(new Line<T>(lineConfig));
    }
  }

  private createStackedComponents(): void {
    const keys = this.categoryKeys();
    const series = this.series();
    const gradientColors = series.map(s => `url(#${s.gradientId})`);
    const colors = this.colors();
    const yAccessors = createStackedYAccessors<T>(keys);
    const lineYAccessors = createCumulativeYAccessors<T>(keys);
    const styleParams = this.getStyleParams();

    const areaConfig = buildAreaConfig<T>({ y: yAccessors, color: gradientColors }, styleParams);
    this.areas.push(new Area<T>(areaConfig));

    const lineConfig = buildLineConfig<T>(
      { y: lineYAccessors, color: colors },
      { lineWidth: this.lineWidth(), curveType: this.curveType() }
    );
    this.lines.push(new Line<T>(lineConfig));
  }

  private createAxes(): void {
    if (!this.hideXAxis()) {
      this.xAxis = new Axis<T>(this.getXAxisConfig());
    }

    if (!this.hideYAxis()) {
      this.yAxis = new Axis<T>(this.getYAxisConfig());
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

  // ===== COMPONENT UPDATE =====
  private updateNonStackedComponents(): void {
    const seriesData = this.series();
    const styleParams = this.getStyleParams();

    seriesData.forEach((s, index) => {
      const yAccessor = (d: T) => Number(d[s.key]);

      const areaConfig = buildAreaConfig<T>(
        { y: yAccessor, color: `url(#${s.gradientId})` },
        styleParams
      );
      this.areas[index]?.setConfig(areaConfig);

      const lineConfig = buildLineConfig<T>(
        { y: yAccessor, color: s.color, lineDashArray: s.lineDashArray },
        { lineWidth: this.lineWidth(), curveType: this.curveType() }
      );
      this.lines[index]?.setConfig(lineConfig);
    });
  }

  private updateStackedComponents(): void {
    const keys = this.categoryKeys();
    const series = this.series();
    const gradientColors = series.map(s => `url(#${s.gradientId})`);
    const colors = this.colors();
    const yAccessors = createStackedYAccessors<T>(keys);
    const lineYAccessors = createCumulativeYAccessors<T>(keys);
    const styleParams = this.getStyleParams();

    const areaConfig = buildAreaConfig<T>({ y: yAccessors, color: gradientColors }, styleParams);
    this.areas[0]?.setConfig(areaConfig);

    const lineConfig = buildLineConfig<T>(
      { y: lineYAccessors, color: colors },
      { lineWidth: this.lineWidth(), curveType: this.curveType() }
    );
    this.lines[0]?.setConfig(lineConfig);
  }

  private updateAxes(): void {
    if (this.xAxis) {
      this.xAxis.setConfig(this.getXAxisConfig());
    }

    if (this.yAxis) {
      this.yAxis.setConfig(this.getYAxisConfig());
    }
  }

  private updateContainer(data: T[]): void {
    if (!this.container) return;
    this.container.updateContainer(this.getContainerConfig());
    this.container.setData(data);
  }

  // ===== CONFIG HELPERS =====
  private getStyleParams() {
    return {
      hideArea: this.hideArea(),
      curveType: this.curveType(),
    };
  }

  private getXAxisConfig() {
    return buildXAxisConfig({
      label: this.xLabel(),
      numTicks: this.xNumTicks(),
      tickFormat: this.xFormatter(),
      tickValues: this.xExplicitTicksValues(),
      gridLine: this.xGridLine(),
      domainLine: this.xDomainLine(),
      tickLine: this.xTickLine(),
      minMaxTicksOnly: this.minMaxTicksOnly(),
    });
  }

  private getYAxisConfig() {
    return buildYAxisConfig({
      label: this.yLabel(),
      numTicks: this.yNumTicks(),
      tickFormat: this.yFormatter(),
      gridLine: this.yGridLine(),
      domainLine: this.yDomainLine(),
      tickLine: this.yTickLine(),
    });
  }

  private getContainerConfig() {
    return buildContainerConfig({
      height: this.height(),
      padding: this.padding(),
      yDomain: this.yDomain(),
      xDomain: this.xDomain(),
      components: [...this.areas, ...this.lines],
      xAxis: this.xAxis ?? undefined,
      yAxis: this.yAxis ?? undefined,
      crosshair: this.crosshair ?? undefined,
      tooltip: this.tooltip ?? undefined,
    });
  }
}
