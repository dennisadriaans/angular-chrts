import { Routes } from '@angular/router';
import { LineChartPageComponent } from './pages/line-chart-page';
import { AreaChartPageComponent } from './pages/area-chart-page';
import { BarChartPageComponent } from './pages/bar-chart-page';
import { DonutChartPageComponent } from './pages/donut-chart-page';
import { BubbleChartPageComponent } from './pages/bubble-chart-page';
import { GanttChartPageComponent } from './pages/gantt-chart-page';

export const routes: Routes = [
  { path: 'line', component: LineChartPageComponent },
  { path: 'area', component: AreaChartPageComponent },
  { path: 'bar', component: BarChartPageComponent },
  { path: 'donut', component: DonutChartPageComponent },
  { path: 'bubble', component: BubbleChartPageComponent },
  { path: 'gantt', component: GanttChartPageComponent },
  { path: '', redirectTo: 'line', pathMatch: 'full' }
];
