import { Component } from '@angular/core';
import { LineChartComponent, CurveType } from 'angular-chrts';
import { data, categories, formatX } from '../data';

@Component({
  selector: 'app-line-chart-page',
  standalone: true,
  imports: [LineChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Line Chart</h2>
      <ngx-line-chart 
        [data]="data" 
        [categories]="categories"
        [height]="400"
        [xFormatter]="formatX"
        xLabel="Month"
        yLabel="Value"
        [curveType]="CurveType.MonotoneX"
        [xGridLine]="true"
        [yGridLine]="true"
      ></ngx-line-chart>
    </div>
  `,
})
export class LineChartPageComponent {
  protected readonly data = data;
  protected readonly categories = categories;
  protected readonly CurveType = CurveType;
  protected readonly formatX = formatX;
}
