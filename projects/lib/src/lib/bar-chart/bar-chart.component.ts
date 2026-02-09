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
  GroupedBar,
  StackedBar,
  XYLabels,
  Axis,
  Tooltip,
  BulletLegend,
  Orientation,
} from '@unovis/ts';

// Shared library types
import { LegendPosition, BulletLegendItemInterface, AxisConfig } from '../types/index';
import { TooltipComponent } from '../tooltip/tooltip.component';

// Local extracted modules
import type { BarStructuralSignature, ValueLabel } from './types';
import {
  buildGroupedBarConfig,
  buildStackedBarConfig,
  buildBarXAxisConfig,
  buildBarYAxisConfig,
  buildBarContainerConfig,
  buildBarLabelsConfig,
} from './config';
import {
  createYAccessors,
  extractBarColors,
  extractBarLegendItems,
  createTickFormatter,
  calculateBarOffset,
} from './utils';
import { unwrapTooltipData } from '../utils/chart-utils';
import { hasBarSignatureChanged } from './state';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-bar-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
      [style]="chartStyle()"
      (click)="onClick($event)"
    >
      <!-- Chart container managed by unovis/ts -->
      <div #chartContainer class="ngx-bar-chart-container"></div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-bar-chart-legend"
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
  styles: [`
    /* 
     * Target the text and rect elements inside the label group marked with data-ngx-label-floating.
     * We use a data attribute selector because Unovis class names can be dynamic/hashed.
     * ng-deep is used because these elements are appended dynamically by Unovis.
     */
    :host ::ng-deep [data-ngx-label-floating="true"] text,
    :host ::ng-deep [data-ngx-label-floating="true"] rect {
      transform: translateY(var(--ngx-label-offset, 0));
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent<T extends Record<string, any>> implements OnDestroy {
  // ===== DATA INPUTS =====
  /** The data to be displayed in the bar chart. */
  readonly data = input.required<T[]>();

  /** Configuration for each category mapping to the axes. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** The data keys to use for the Y-axis (or X-axis if horizontal). */
  readonly yAxis = input.required<(keyof T)[]>();

  // ===== CHART APPEARANCE =====
  /** The height of the chart in pixels. Default is 400. */
  readonly height = input<number>(400);

  /** Padding around the chart area. */
  readonly padding = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });

  /** Whether to stack the bars on top of each other. */
  readonly stacked = input<boolean>(false);

  /** The orientation of the bars (Vertical or Horizontal). */
  readonly orientation = input<Orientation>(Orientation.Vertical);

  /** Corner radius for the bars. */
  readonly radius = input<number>();

  /** Padding between bar groups. Value between 0 and 1. */
  readonly groupPadding = input<number>(0);

  /** Padding between individual bars. Value between 0 and 1. */
  readonly barPadding = input<number>(0.2);

  // ===== AXIS CONFIGURATION =====
  /** Label for the X axis. */
  readonly xLabel = input<string>();

  /** Label for the Y axis. */
  readonly yLabel = input<string>();

  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();

  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();

  /** Number of ticks to show on the X axis. */
  readonly xNumTicks = input<number>();

  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();
  readonly xExplicitTicksValues = computed(() => this.xExplicitTicks() as number[] | undefined);

  /** If true, only shows the first and last tick labels on the X axis. */
  readonly minMaxTicksOnly = input<boolean>(false);

  /** Number of ticks to show on the Y axis. */
  readonly yNumTicks = input<number>();

  // ===== AXIS VISIBILITY =====
  /** Whether to hide the X axis entirely. */
  readonly hideXAxis = input<boolean>(false);

  /** Whether to hide the Y axis entirely. */
  readonly hideYAxis = input<boolean>(false);

  /** Whether to show grid lines for the X axis. */
  readonly xGridLine = input<boolean>(false);

  /** Whether to show grid lines for the Y axis. */
  readonly yGridLine = input<boolean>(true);

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

  // ===== LEGEND CONFIGURATION =====
  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Position of the legend relative to the chart. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);

  /** Custom styles for the legend. */
  readonly legendStyle = input<Record<string, string>>();

  // ===== ADVANCED CONFIGURATION =====
  /** Whether to show value labels on the chart. */
  readonly showLabels = input<boolean>(false);

  /** Formatter function for labels. Defaults to (d) => string(value). */
  readonly labelFormatter = input<(d: T) => string | undefined>();

  /** Color for labels. Defaults to series color. */
  readonly labelColor = input<string | ((d: T) => string)>();

  /** Background color for labels. Useful for creating dot/marker effects. */
  readonly labelBackgroundColor = input<string | ((d: T) => string)>();

  /** Vertical offset for labels (e.g., "-10px" to float above). */
  readonly labelVerticalOffset = input<string>();

  /** Configuration for value labels on bars. */
  readonly valueLabel = input<ValueLabel>();

  /** Advanced configuration for the X axis. */
  readonly xAxisConfig = input<AxisConfig>();

  /** Advanced configuration for the Y axis. */
  readonly yAxisConfig = input<AxisConfig>();

  // ===== OUTPUTS =====
  /** Event emitted when a bar is clicked. */
  readonly click = output<{ event: MouseEvent; values?: T }>();

  // ===== TEMPLATE REFS =====
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // ===== STATE =====
  readonly hoverValues = signal<T | undefined>(undefined);
  private lastSignature: BarStructuralSignature | null = null;

  // Expose Orientation for template
  readonly Orientation = Orientation;

  // ===== UNOVIS INSTANCES =====
  private container: XYContainer<T> | null = null;
  private barComponent: GroupedBar<T> | StackedBar<T> | null = null;
  private labels: XYLabels<T>[] = [];
  private xAxisComponent: Axis<T> | null = null;
  private yAxisComponent: Axis<T> | null = null;
  private tooltip: Tooltip | null = null;
  private legend: BulletLegend | null = null;

  // ===== INJECTED SERVICES =====
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // ===== COMPUTED VALUES =====
  readonly categoryKeys = computed(() => Object.keys(this.categories()));

  readonly dataIndexMap = computed(() => {
    const map = new Map<T, number>();
    this.data().forEach((d, i) => map.set(d, i));
    return map;
  });

  readonly isLegendTop = computed(() => this.legendPosition().startsWith('top'));

  readonly legendAlignment = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  readonly legendItems = computed(() => extractBarLegendItems(this.categories()));

  readonly yAccessors = computed(() => createYAccessors<T>(this.yAxis()));

  readonly colors = computed(() => extractBarColors(this.categories()));

  readonly chartStyle = computed(() => {
    const vars: Record<string, string> = {};
    const offset = this.labelVerticalOffset();
    if (offset) {
      vars['--ngx-label-offset'] = offset;
    }
    return vars;
  });

  readonly structuralSignature = computed((): BarStructuralSignature => ({
    stacked: this.stacked(),
    categoryKeys: this.categoryKeys().join(','),
    yAxisKeys: this.yAxis().map(String).join(','),
    hideXAxis: this.hideXAxis(),
    hideYAxis: this.hideYAxis(),
    hideTooltip: this.hideTooltip(),
    orientation: this.orientation(),
    showLabels: this.showLabels(),
  }));

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
  private syncChart(element: HTMLElement, data: T[], signature: BarStructuralSignature): void {
    const needsRebuild = hasBarSignatureChanged(signature, this.lastSignature);

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
    this.createBarComponent();
    this.createLabelsComponent();
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

    this.updateBarComponent();
    this.updateLabelsComponent();
    this.updateAxes();
    this.updateContainer(data);
  }

  // ===== BAR COMPONENT =====
  private createBarComponent(): void {
    const configOptions = this.getBarConfigOptions();

    if (this.stacked()) {
      const config = buildStackedBarConfig<T>(configOptions);
      this.barComponent = new StackedBar<T>(config);
    } else {
      const config = buildGroupedBarConfig<T>(configOptions);
      this.barComponent = new GroupedBar<T>(config);
    }
  }

  private updateBarComponent(): void {
    const configOptions = this.getBarConfigOptions();

    if (this.stacked() && this.barComponent instanceof StackedBar) {
      const config = buildStackedBarConfig<T>(configOptions);
      this.barComponent.setConfig(config);
    } else if (!this.stacked() && this.barComponent instanceof GroupedBar) {
      const config = buildGroupedBarConfig<T>(configOptions);
      this.barComponent.setConfig(config);
    }
  }

  private getBarConfigOptions() {
    return {
      yAccessors: this.yAccessors(),
      colors: this.colors(),
      radius: this.radius(),
      barPadding: this.barPadding(),
      groupPadding: this.groupPadding(),
      orientation: this.orientation(),
    };
  }

  // ===== LABELS COMPONENT =====
  private createLabelsComponent(): void {
    this.labels = [];
    if (!this.showLabels()) return;

    const yAccessors = this.yAccessors();
    const colors = this.colors();
    const isStacked = this.stacked();
    const numSeries = yAccessors.length;
    const groupPadding = this.groupPadding();
    const barPadding = this.barPadding();

    yAccessors.forEach((yAccessor, i) => {
      // Calculate offset for grouped bars (0 for stacked)
      const offset = isStacked 
        ? 0 
        : calculateBarOffset(i, numSeries, groupPadding, barPadding);

      const config = buildBarLabelsConfig<T>({
        x: (d: T) => (this.dataIndexMap().get(d) ?? 0) + offset,
        y: (d: T) => {
          const val = typeof yAccessor === 'function' ? yAccessor(d, 0) : yAccessor;
          return Number(val);
        },
        color: this.labelColor() ?? colors[i],
        backgroundColor: this.labelBackgroundColor(),
        label: this.labelFormatter() ?? ((d: T) => {
          const val = typeof yAccessor === 'function' ? yAccessor(d, 0) : yAccessor;
          return String(val ?? '');
        }),
        labelVerticalOffset: this.labelVerticalOffset(),
        orientation: this.orientation(),
      });
      this.labels.push(new XYLabels<T>(config));
    });
  }

  private updateLabelsComponent(): void {
    if (!this.showLabels()) {
      this.labels = [];
      return;
    }

    const yAccessors = this.yAccessors();
    const colors = this.colors();
    const isStacked = this.stacked();
    const numSeries = yAccessors.length;
    const groupPadding = this.groupPadding();
    const barPadding = this.barPadding();

    // If counts match, update existing. Else recreate.
    if (this.labels.length === yAccessors.length) {
      yAccessors.forEach((yAccessor, i) => {
        // Calculate offset for grouped bars (0 for stacked)
        const offset = isStacked 
          ? 0 
          : calculateBarOffset(i, numSeries, groupPadding, barPadding);

        const config = buildBarLabelsConfig<T>({
          x: (d: T) => (this.dataIndexMap().get(d) ?? 0) + offset,
          y: (d: T) => {
            const val = typeof yAccessor === 'function' ? yAccessor(d, 0) : yAccessor;
            return Number(val);
          },
          color: this.labelColor() ?? colors[i],
          backgroundColor: this.labelBackgroundColor(),
          label: this.labelFormatter() ?? ((d: T) => {
            const val = typeof yAccessor === 'function' ? yAccessor(d, 0) : yAccessor;
            return String(val ?? '');
          }),
          labelVerticalOffset: this.labelVerticalOffset(),
          orientation: this.orientation(),
        });
        this.labels[i].setConfig(config);
      });
    } else {
      this.createLabelsComponent();
    }
  }

  // ===== AXES =====
  private createAxes(): void {
    if (!this.hideXAxis()) {
      this.xAxisComponent = new Axis<T>(this.getXAxisConfig());
    }

    if (!this.hideYAxis()) {
      this.yAxisComponent = new Axis<T>(this.getYAxisConfig());
    }
  }

  private updateAxes(): void {
    if (this.xAxisComponent) {
      this.xAxisComponent.setConfig(this.getXAxisConfig());
    }

    if (this.yAxisComponent) {
      this.yAxisComponent.setConfig(this.getYAxisConfig());
    }
  }

  private getXAxisConfig() {
    const isHorizontal = this.orientation() === Orientation.Horizontal;
    return buildBarXAxisConfig({
      label: isHorizontal ? this.yLabel() : this.xLabel(),
      numTicks: isHorizontal ? this.yNumTicks() : this.xNumTicks(),
      tickFormat: createTickFormatter(isHorizontal ? this.yFormatter() : this.xFormatter()),
      tickValues: this.xExplicitTicksValues(),
      gridLine: this.xGridLine(),
      domainLine: this.xDomainLine(),
      tickLine: this.xTickLine(),
      minMaxTicksOnly: this.minMaxTicksOnly(),
    });
  }

  private getYAxisConfig() {
    const isHorizontal = this.orientation() === Orientation.Horizontal;
    return buildBarYAxisConfig({
      label: isHorizontal ? this.xLabel() : this.yLabel(),
      numTicks: isHorizontal ? this.xNumTicks() : this.yNumTicks(),
      tickFormat: createTickFormatter(isHorizontal ? this.xFormatter() : this.yFormatter()),
      gridLine: this.yGridLine(),
      domainLine: this.yDomainLine(),
      tickLine: this.yTickLine(),
      orientation: this.orientation(),
    });
  }

  // ===== TOOLTIP =====
  private createTooltip(): void {
    if (this.hideTooltip()) return;

    this.tooltip = new Tooltip({
      triggers: {
        [GroupedBar.selectors.bar]: (d: T) => this.getTooltipContent(d),
        [StackedBar.selectors.bar]: (d: T) => this.getTooltipContent(d),
      },
    });
  }

  private getTooltipContent(d: any): string {
    const data = unwrapTooltipData(d, this.data());
    this.hoverValues.set(data);
    this.cdr.detectChanges();
    return data ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }

  // ===== CONTAINER =====
  private getContainerConfig() {
    return buildBarContainerConfig({
      height: this.height(),
      padding: this.padding(),
      components: [
        ...(this.barComponent ? [this.barComponent] : []),
        ...this.labels,
      ],
      xAxis: this.xAxisComponent ?? undefined,
      yAxis: this.yAxisComponent ?? undefined,
      tooltip: this.tooltip ?? undefined,
    });
  }

  private updateContainer(data: T[]): void {
    if (!this.container) return;
    this.container.updateContainer(this.getContainerConfig());
    this.container.setData(data);
  }

  // ===== LEGEND =====
  private updateLegend(element: HTMLElement, items: BulletLegendItemInterface[]): void {
    if (!this.legend) {
      this.legend = new BulletLegend(element, { items });
    } else {
      this.legend.update({ items });
    }
  }

  // ===== CLEANUP =====
  private destroyChart(): void {
    this.container?.destroy();
    this.legend?.destroy();
    this.container = null;
    this.legend = null;
    this.barComponent = null;
    this.labels = [];
    this.xAxisComponent = null;
    this.yAxisComponent = null;
    this.tooltip = null;
  }

  // ===== EVENT HANDLERS =====
  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }
}
