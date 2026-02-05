# Accessibility Guide for Angular Charts

This guide provides comprehensive information about the accessibility features in angular-chrts and how to use them to meet WCAG 2.1 AA standards.

## Overview

All chart components in angular-chrts are designed to meet **WCAG 2.1 Level AA** accessibility standards, ensuring your data visualizations are accessible to users with disabilities.

## Key Accessibility Features

### 1. ARIA Roles and Labels

Every chart component includes proper ARIA roles and labels:

- **`role="img"`**: Identifies the chart as an image for screen readers
- **`aria-label`**: Provides a concise description of the chart
- **`aria-describedby`**: Points to a detailed description element
- **`tabindex="0"`**: Enables keyboard navigation

### 2. Semantic HTML

- **Legends**: Marked with `role="list"` and `aria-label="Chart legend"`
- **Tooltips**: Marked with `role="tooltip"`
- **Decorative SVG**: Hidden from screen readers with `aria-hidden="true"`

### 3. Keyboard Accessibility

All charts are keyboard-accessible, allowing users to:
- Tab to focus on charts
- Navigate through interactive elements
- Access tooltips without a mouse

## Usage Examples

### Basic Example with Accessibility

```typescript
import { Component } from '@angular/core';
import { BarChartComponent } from 'angular-chrts';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [BarChartComponent],
  template: `
    <ngx-bar-chart
      [data]="revenueData"
      [categories]="categories"
      [yAxis]="['sales', 'profit']"
      xLabel="Month"
      yLabel="Revenue (USD)"
      ariaLabel="Monthly revenue chart showing sales and profit trends from January to June"
      ariaDescribedBy="revenue-description"
    />
    
    <p id="revenue-description" class="sr-only">
      This bar chart displays monthly revenue data comparing sales and profit 
      over a six-month period. Sales are shown in blue bars and profit in green bars.
      Sales range from $45,000 to $52,000, while profit ranges from $18,000 to $24,000.
      The highest sales occurred in February at $52,000.
    </p>
  `
})
export class RevenueChartComponent {
  revenueData = [
    { month: 'Jan', sales: 45000, profit: 18000 },
    { month: 'Feb', sales: 52000, profit: 21000 },
    { month: 'Mar', sales: 48000, profit: 19500 },
    { month: 'Apr', sales: 51000, profit: 22000 },
    { month: 'May', sales: 49000, profit: 20000 },
    { month: 'Jun', sales: 50000, profit: 24000 },
  ];

  categories = {
    sales: { name: 'Sales', color: '#3b82f6' },
    profit: { name: 'Profit', color: '#22c55e' }
  };
}
```

### CSS for Screen Reader Only Content

Add this CSS to your global styles to hide descriptions visually while keeping them accessible:

```css
.sr-only,
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Best Practices

### 1. Always Provide Meaningful Labels

**Good:**
```typescript
ariaLabel="Annual sales performance showing growth from Q1 to Q4"
```

**Bad:**
```typescript
ariaLabel="Chart"
```

### 2. Include Detailed Descriptions

Provide context that helps users understand the data without seeing it:

```html
<p id="sales-description" class="sr-only">
  This line chart shows quarterly sales from Q1 to Q4 2024.
  Sales started at $1.2 million in Q1, increased to $1.8 million in Q2,
  peaked at $2.1 million in Q3, and finished at $1.9 million in Q4.
  This represents a 58% growth from Q1 to Q3.
</p>
```

### 3. Use Descriptive Axis Labels

```typescript
xLabel="Quarter (2024)"
yLabel="Revenue (Millions USD)"
```

### 4. Don't Rely on Color Alone

While angular-chrts uses accessible color palettes by default, always:
- Keep legends visible (`hideLegend` should be false by default)
- Use clear category names
- Consider using patterns or shapes when possible

### 5. Test with Screen Readers

Test your charts with popular screen readers:
- **NVDA** (Windows, free)
- **JAWS** (Windows, commercial)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

## Complete Example - All Chart Types

### Line Chart

```typescript
<ngx-line-chart
  [data]="temperatureData"
  [categories]="tempCategories"
  xLabel="Date"
  yLabel="Temperature (°F)"
  ariaLabel="7-day temperature forecast showing daily high and low temperatures"
  ariaDescribedBy="temp-description"
/>
```

### Donut Chart

```typescript
<ngx-donut-chart
  [data]="marketShareData"
  [categories]="marketCategories"
  ariaLabel="Market share distribution showing Product at 45%, Services at 35%, and Other at 20%"
  ariaDescribedBy="market-description"
/>
```

### Bubble Chart

```typescript
<ngx-bubble-chart
  [data]="comparisonData"
  [categories]="bubbleCategories"
  xLabel="Customer Satisfaction (%)"
  yLabel="Revenue Growth (%)"
  ariaLabel="Product comparison bubble chart showing satisfaction vs growth"
  ariaDescribedBy="bubble-description"
/>
```

### Gantt Chart

```typescript
<ngx-gantt-chart
  [data]="projectTasks"
  [categories]="taskCategories"
  [x]="taskStart"
  [length]="taskDuration"
  [type]="taskType"
  ariaLabel="Project timeline showing tasks from January to June"
  ariaDescribedBy="gantt-description"
/>
```

## WCAG 2.1 AA Criteria Met

### Level A Criteria

- **1.1.1 Non-text Content**: Charts include text alternatives via `aria-label` and `aria-describedby`
- **2.1.1 Keyboard**: All chart functionality is keyboard accessible
- **4.1.2 Name, Role, Value**: All components have appropriate ARIA roles and labels

### Level AA Criteria

- **1.4.3 Contrast (Minimum)**: Default color palettes meet 4.5:1 contrast ratio for text
- **1.4.11 Non-text Contrast**: Chart elements meet 3:1 contrast ratio
- **2.4.6 Headings and Labels**: All axis labels and legends are descriptive

## Testing Checklist

Use this checklist when implementing accessible charts:

- [ ] Added `ariaLabel` input with meaningful description
- [ ] Added detailed description element with unique ID
- [ ] Connected description via `ariaDescribedBy`
- [ ] Provided descriptive `xLabel` and `yLabel`
- [ ] Used `.sr-only` or `.visually-hidden` class for descriptions
- [ ] Kept legend visible (unless intentionally hidden)
- [ ] Tested with keyboard navigation (Tab key)
- [ ] Tested with screen reader
- [ ] Verified chart renders correctly
- [ ] Included data summary in description

## Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles on Accessibility](https://webaim.org/articles/)
- [Angular Accessibility Guide](https://angular.io/guide/accessibility)

## Support

If you have questions about accessibility features or need help implementing them, please:

1. Check the [main README](./README.md) for general documentation
2. Review the [library README](./projects/lib/README.md) for detailed API reference
3. Open an issue on [GitHub](https://github.com/dennisadriaansen/angular-chrts/issues)

## License

MIT © [Dennis Adriaansen](https://github.com/dennisadriaansen)
