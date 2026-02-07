/**
 * Donut Chart Component
 *
 * A configurable donut/pie chart component built on Unovis.
 * Supports full and half-circle variants with optional legend and tooltip.

* @example
 * ```html
 * <ngx-donut-chart
 *   [data]="[30, 45, 25]"
 *   [categories]="{ a: { name: 'A', color: '#3b82f6' }, b: { name: 'B', color: '#ef4444' }, c: { name: 'C', color: '#22c55e' } }"
 *   [type]="DonutType.Full"
 * >
 *   <span class="center-text">Total: 100</span>
 * </ngx-donut-chart>
 * ```
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
import { SingleContainer, Donut, Tooltip, BulletLegend } from '@unovis/ts';

import { LegendPosition, type BulletLegendItemInterface } from '../types';
import { TooltipComponent } from '../tooltip/index';

import { DonutType, type DonutStructuralSignature } from './types';
import { buildDonutConfig, buildDonutContainerConfig } from './config';
import {
  extractDonutColors,
  extractDonutLegendItems,
  getLegendAlignment,
  isLegendAtTop,
} from './utils';
import {
  createDonutStructuralSignature,
  hasDonutSignatureChanged,
} from './state';

@Component({
  selector: 'ngx-donut-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-donut-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="legendOnTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing, 8px)'"
      (click)="onClick($event)"
    >
      <!-- Chart container for donut -->
      <div #chartContainer class="ngx-donut-chart-container" style="position: relative;">
        <!-- Centered content slot -->
        <div
          class="ngx-donut-chart-center"
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;"
        >
          <ng-content></ng-content>
        </div>
      </div>

      @if (!hideLegend()) {
        <div
          #legendContainer
          class="ngx-donut-chart-legend"
          [style.display]="'flex'"
          [style.justifyContent]="legendAlign()"
        ></div>
      }

      <!-- Hidden tooltip template -->
      <div #tooltipWrapper style="display: none">
        @if (hoverValues()) {
          <ngx-tooltip
            [data]="hoverValues()!"
            [categories]="categories()"
            [titleFormatter]="tooltipTitleFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent implements OnDestroy {
  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** The data to be displayed in the donut chart as an array of values. */
  readonly data = input.required<number[]>();

  /** The height of the chart in pixels. Default is 400. */
  readonly height = input<number>(400);

  /** Configuration for each category mapping to the data segments. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** The type of donut chart (Full or Half). */
  readonly type = input<DonutType>(DonutType.Full);

  /** Corner radius of the donut segments. */
  readonly radius = input<number>(0);

  /** Width of the donut arcs. Default is 20. */
  readonly arcWidth = input<number>(20);

  /** Angle between donut segments. Default is 0. */
  readonly padAngle = input<number>(0);

  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);

  /** Position of the legend relative to the chart. Default is BottomCenter. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);

  /** Custom styles for the legend container. */
  readonly legendStyle = input<Record<string, string>>();

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: any) => string | number>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Event emitted when a donut segment is clicked. */
  readonly click = output<{ event: MouseEvent; values?: any }>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Template References
  // ─────────────────────────────────────────────────────────────────────────────

  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  readonly hoverValues = signal<any>(undefined);
  private structuralSignature: DonutStructuralSignature | null = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Unovis Instances
  // ─────────────────────────────────────────────────────────────────────────────

  private container: SingleContainer<number[]> | null = null;
  private donutComponent: Donut<number> | null = null;
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
  readonly legendOnTop = computed(() => isLegendAtTop(this.legendPosition()));

  /** CSS alignment for legend container */
  readonly legendAlign = computed(() => getLegendAlignment(this.legendPosition()));

  /** Extracted colors from categories */
  readonly colors = computed(() => extractDonutColors(this.categories()));

  /** Normalized legend items */
  readonly legendItems = computed(() => extractDonutLegendItems(this.categories()));

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
      this.type();
      this.radius();
      this.arcWidth();
      this.padAngle();
      this.height();
      this.hideTooltip();

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

  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods - Chart Synchronization
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Synchronizes the chart state with current inputs.
   * Uses signature-based detection to determine if rebuild is needed.
   */
  private syncChart(element: HTMLElement, data: number[]): void {
    const currentSignature = createDonutStructuralSignature(
      this.type(),
      this.hideTooltip(),
      this.hideLegend()
    );

    const needsRebuild = hasDonutSignatureChanged(
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
   * Called when structural changes require new component instances.
   */
  private rebuildChart(element: HTMLElement, data: number[]): void {
    this.destroyChart();

    const donutConfig = buildDonutConfig<number>({
      radius: this.radius(),
      arcWidth: this.arcWidth(),
      colors: this.colors(),
      type: this.type(),
      padAngle: this.padAngle(),
    });

    this.donutComponent = new Donut<number>(donutConfig);

    if (!this.hideTooltip()) {
      this.tooltip = new Tooltip({
        horizontalShift: 20,
        verticalShift: 20,
        triggers: {
          [Donut.selectors.segment]: (d: any) => this.getTooltipContent(d),
        },
      });
    }

    const containerConfig = buildDonutContainerConfig<number[]>({
      height: this.height(),
    });

    this.container = new SingleContainer<number[]>(
      element,
      {
        ...containerConfig,
        component: this.donutComponent,
        tooltip: this.tooltip ?? undefined,
      },
      data
    );
  }

  /**
   * Updates existing chart components with new configuration.
   * Called when only non-structural properties change.
   */
  private updateChart(data: number[]): void {
    if (!this.container || !this.donutComponent) return;

    const donutConfig = buildDonutConfig<number>({
      radius: this.radius(),
      arcWidth: this.arcWidth(),
      colors: this.colors(),
      type: this.type(),
      padAngle: this.padAngle(),
    });

    this.donutComponent.setConfig(donutConfig);

    const containerConfig = buildDonutContainerConfig<number[]>({
      height: this.height(),
    });

    this.container.updateContainer({
      ...containerConfig,
      component: this.donutComponent,
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
    this.donutComponent = null;
    this.tooltip = null;
    this.legend = null;
  }

  /**
   * Generates tooltip HTML content for a hovered segment.
   */
  private getTooltipContent(d: any): string {
    const keyName = Object.values(this.categories())[d?.index]?.name;
    this.hoverValues.set({
      label: keyName,
      [keyName]: d?.data,
    });
    this.cdr.detectChanges();
    return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }
}
