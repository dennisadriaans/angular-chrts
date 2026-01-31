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
import { LegendPosition, BulletLegendItemInterface } from '../types';
import { TooltipComponent } from '../tooltip';
import { DonutType } from './types';

@Component({
  selector: 'ngx-donut-chart',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div
      class="ngx-donut-chart-wrapper"
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
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
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent implements OnDestroy {
  /** The data to be displayed in the donut chart as an array of values. */
  readonly data = input.required<number[]>();

  /** The height of the chart in pixels. Default is 400. */
  readonly height = input<number>(400);

  /** Configuration for each category mapping to the data segments. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();

  /** The type of donut chart (Full or Half). */
  readonly type = input<DonutType>(DonutType.Full);

  /** Inner radius of the donut segments. */
  readonly radius = input<number>(0);

  /** Width of the donut arcs. Default is 20. */
  readonly arcWidth = input<number>(20);

  /** Angle between donut segments. Default is 0. */
  readonly padAngle = input<number>(0);

  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);

  /** Position of the legend relative to the chart. Default is BottomCenter. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);

  /** Custom styles for the legend container. */
  readonly legendStyle = input<Record<string, string>>();

  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: any) => string | number>();

  /** Event emitted when a donut segment is clicked. */
  readonly click = output<{ event: MouseEvent; values?: any }>();

  // Template refs
  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly legendContainer = viewChild<ElementRef<HTMLDivElement>>('legendContainer');
  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');

  // State
  readonly hoverValues = signal<any>(undefined);

  // Unovis instances
  private container: SingleContainer<number[]> | null = null;
  private donut: Donut<number> | null = null;
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

  readonly categoriesArray = computed(() => Object.values(this.categories()));

  readonly legendItems = computed(() => {
    return this.categoriesArray().map((item) => ({
      ...item,
      color: this.normalizeColor(item.color),
    }));
  });

  readonly angleRange = computed((): [number, number] | undefined => {
    return this.type() === DonutType.Half
      ? [-1.5707963267948966, 1.5707963267948966]
      : undefined;
  });

  readonly colors = computed(() => {
    return this.categoriesArray().map((item) => this.normalizeColor(item.color));
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

  private initializeChart(element: HTMLElement, data: number[]): void {
    const colors = this.colors();

    // Create donut component
    this.donut = new Donut<number>({
      value: (d: number) => d,
      cornerRadius: this.radius(),
      arcWidth: this.arcWidth(),
      color: colors,
      angleRange: this.angleRange(),
      padAngle: this.padAngle(),
    });

    // Create tooltip
    this.tooltip = new Tooltip({
      horizontalShift: 20,
      verticalShift: 20,
      triggers: {
        [Donut.selectors.segment]: (d: any) => this.getTooltipContent(d),
      },
    });

    // Create container
    this.container = new SingleContainer<number[]>(element, {
      height: this.height(),
      margin: {},
      component: this.donut,
      tooltip: this.tooltip,
    }, data);
  }

  private updateChart(data: number[]): void {
    if (!this.container || !this.donut) return;

    const colors = this.colors();

    // Update donut config
    this.donut.setConfig({
      value: (d: number) => d,
      cornerRadius: this.radius(),
      arcWidth: this.arcWidth(),
      color: colors,
      angleRange: this.angleRange(),
      padAngle: this.padAngle(),
    });

    // Update container
    this.container.updateContainer({
      height: this.height(),
      margin: {},
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
    this.donut = null;
    this.tooltip = null;
    this.legend = null;
  }

  private getTooltipContent(d: any): string {
    const keyName = Object.values(this.categories())[d?.index]?.name;
    this.hoverValues.set({
      label: keyName,
      [keyName]: d?.data,
    });
    this.cdr.detectChanges();
    return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
  }

  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }

  private normalizeColor(color: string | string[] | undefined, fallback = '#ccc'): string {
    if (!color) return fallback;
    return Array.isArray(color) ? color[0] || fallback : color;
  }
}
