import { AreaChartCategory } from 'angular-chrts';

export interface ChartData {
  date: string;
  value: number;
  sales: number;
  profit: number;
}

export interface BubbleData {
  x: number;
  y: number;
  size: number;
  category: string;
}

export interface GanttData {
  label: string;
  start: number;
  end: number;
  type: string;
}

export const data: ChartData[] = [
  { date: '2024-01-01', value: 12, sales: 100, profit: 50 },
  { date: '2024-02-01', value: 18, sales: 120, profit: 55 },
  { date: '2024-03-01', value: 9, sales: 180, profit: 80 },
  { date: '2024-04-01', value: 22, sales: 110, profit: 40 },
  { date: '2024-05-01', value: 16, sales: 90, profit: 30 },
  { date: '2024-06-01', value: 28, sales: 150, profit: 70 },
];
  
export const areaCategories: Record<string, AreaChartCategory> = {
  sales: {
    name: 'Sales',
    color: 'var(--test-color)',
  },
  profit: {
    name: 'Profit',
    color: '#10b981',
  },
};

export const stackedData: ChartData[] = [
  { date: '2024-01-01', value: 10, sales: 40, profit: 20 },
  { date: '2024-01-02', value: 12, sales: 42, profit: 21 },
  { date: '2024-01-03', value: 11, sales: 38, profit: 19 },
  { date: '2024-01-04', value: 14, sales: 45, profit: 22 },
  { date: '2024-01-05', value: 15, sales: 48, profit: 24 },
  { date: '2024-01-06', value: 18, sales: 55, profit: 28 }, 
  { date: '2024-01-07', value: 17, sales: 52, profit: 26 },
  { date: '2024-01-08', value: 13, sales: 41, profit: 20 },
  { date: '2024-01-09', value: 12, sales: 39, profit: 19 },
  { date: '2024-01-10', value: 14, sales: 44, profit: 22 },
  { date: '2024-01-11', value: 16, sales: 46, profit: 23 },
  { date: '2024-01-12', value: 19, sales: 58, profit: 29 },
  { date: '2024-01-13', value: 22, sales: 65, profit: 32 },
  { date: '2024-01-14', value: 20, sales: 60, profit: 30 },
  { date: '2024-01-15', value: 15, sales: 45, profit: 22 },
  { date: '2024-01-16', value: 14, sales: 43, profit: 21 },
  { date: '2024-01-17', value: 16, sales: 47, profit: 23 },
  { date: '2024-01-18', value: 18, sales: 50, profit: 25 },
  { date: '2024-01-19', value: 21, sales: 62, profit: 31 },
  { date: '2024-01-20', value: 25, sales: 70, profit: 35 },
  { date: '2024-01-21', value: 23, sales: 68, profit: 34 },
  { date: '2024-01-22', value: 17, sales: 48, profit: 24 },
  { date: '2024-01-23', value: 16, sales: 46, profit: 23 },
  { date: '2024-01-24', value: 18, sales: 52, profit: 26 },
  { date: '2024-01-25', value: 20, sales: 55, profit: 27 },
  { date: '2024-01-26', value: 24, sales: 68, profit: 34 },
  { date: '2024-01-27', value: 28, sales: 80, profit: 40 },
  { date: '2024-01-28', value: 26, sales: 75, profit: 38 },
  { date: '2024-01-29', value: 21, sales: 58, profit: 29 },
  { date: '2024-01-30', value: 19, sales: 54, profit: 27 },
  { date: '2024-01-31', value: 22, sales: 60, profit: 30 },
];

// Donut chart data
export const donutData: number[] = [30, 45, 25];
export const donutCategories: Record<string, AreaChartCategory> = {
  Product: { name: 'Product', color: '#3b82f6' },
  Services: { name: 'Services', color: '#10b981' },
  Other: { name: 'Other', color: '#f59e0b' },
};

// Bubble chart data
export const bubbleData: BubbleData[] = [
  { x: 10, y: 20, size: 5, category: 'A' },
  { x: 25, y: 35, size: 10, category: 'B' },
  { x: 40, y: 15, size: 8, category: 'A' },
  { x: 55, y: 45, size: 15, category: 'B' },
  { x: 70, y: 30, size: 12, category: 'A' },
];
export const bubbleCategories: Record<string, AreaChartCategory> = {
  A: { name: 'Category A', color: '#3b82f6' },
  B: { name: 'Category B', color: '#10b981' },
};

// Gantt chart data
export const ganttData: GanttData[] = [
  { label: 'Task 1', start: Date.now(), end: Date.now() + 86400000 * 3, type: 'design' },
  { label: 'Task 2', start: Date.now() + 86400000 * 2, end: Date.now() + 86400000 * 5, type: 'development' },
  { label: 'Task 3', start: Date.now() + 86400000 * 4, end: Date.now() + 86400000 * 7, type: 'design' },
];
export const ganttCategories: Record<string, AreaChartCategory> = {
  design: { name: 'Design', color: '#3b82f6' },
  development: { name: 'Development', color: '#10b981' },
};

export const formatX = (tick: number | Date) => {
  if (typeof tick === 'number') {
    return data[tick]?.date ?? '';
  }
  return typeof tick === 'object' ? tick.toLocaleDateString() : '';
};

export const formatStackedX = (tick: number | Date) => {
  if (typeof tick === 'number') {
    return stackedData[tick]?.date ?? '';
  }
  return typeof tick === 'object' ? tick.toLocaleDateString() : '';
};
