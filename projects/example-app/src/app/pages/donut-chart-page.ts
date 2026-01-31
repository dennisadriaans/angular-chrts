import { Component } from '@angular/core';
import { DonutChartComponent, DonutType } from 'angular-chrts';
import { donutData, donutCategories } from '../data';

@Component({
  selector: 'app-donut-chart-page',
  standalone: true,
  imports: [DonutChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Donut Chart - Full</h2>
      <ngx-donut-chart 
        [data]="donutData" 
        [categories]="donutCategories"
        [height]="400"
        [radius]="5"
        [arcWidth]="60"
      ></ngx-donut-chart>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Donut Chart - Half</h2>
      <ngx-donut-chart 
        [data]="donutData" 
        [categories]="donutCategories"
        [height]="300"
        [radius]="5"
        [arcWidth]="60"
        [type]="DonutType.Half"
      ></ngx-donut-chart>
    </div>
  `,
})
export class DonutChartPageComponent {
  protected readonly donutData = donutData;
  protected readonly donutCategories = donutCategories;
  protected readonly DonutType = DonutType;
}
