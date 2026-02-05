# Angular Charts Library (`angular-chrts`)

Modern, Signals-first **Angular Charts** powered by Unovis.

## Installation

```bash
npm install angular-chrts @unovis/ts
```

## Features

- **100% AOT Compatible**: Works perfectly in Cloudflare Workers, Vercel Edge, and other edge runtimes
- **No JIT Required**: Built directly on `@unovis/ts` - no Angular-specific wrappers that require JIT compilation
- **SSR Safe**: Browser-specific features (document, window) are safely handled for server-side rendering
- **Tree Shakable**: Only import what you need - unused chart types won't bloat your bundle
- **Signals-based**: Leverages Angular's latest signals API for maximum performance
- **Responsive**: All charts adapt to their container size automatically
- **Customizable**: Full control over axes, tooltips, legends, and styling
- **Typescript Ready**: Robust types for all your data visualization needs
- **WCAG 2.1 AA Compliant**: Built-in accessibility features for screen readers and keyboard navigation

## Quick Start

```typescript
import { LineChartComponent } from 'angular-chrts';

@Component({
  standalone: true,
  imports: [LineChartComponent],
  template: `
    <ngx-line-chart
      [data]="data"
      [categories]="categories"
      xLabel="Time"
    />
  `
})
export class MyDataComponent {
  data = [/* indexable objects */];
  categories = {
    value: { name: 'Performance', color: 'blue' }
  };
}
```

## Available Components

- `LineChartComponent`
- `BarChartComponent`
- `AreaChartComponent`
- `DonutChartComponent`
- `BubbleChartComponent`
- `GanttChartComponent`

## Architecture

This library uses `@unovis/ts` directly instead of `@unovis/angular` NgModules. This provides:

1. **AOT-only compilation** - No need for Angular's JIT compiler at runtime
2. **Edge runtime support** - Works in Cloudflare Workers and other edge environments
3. **Smaller bundle size** - Fewer dependencies and no Angular module overhead
4. **Type-safe API** - Full IDE autocomplete and type checking support

All chart components are standalone and use Angular's modern APIs:
- `input()` signals for reactive inputs
- `output()` for event emissions
- `effect()` for reactive chart updates
- `isPlatformBrowser()` checks for SSR safety

## SSR / Edge Runtime Compatibility

The library includes SSR-safe utilities for browser-specific features:

```typescript
import { isBrowser, getDocument, getWindow } from 'angular-chrts';

// Use in your components
if (isBrowser()) {
  // Safe to access window and document
}
```

## Accessibility (WCAG 2.1 AA Compliance)

All charts in this library are designed to meet WCAG 2.1 AA accessibility standards:

### Key Accessibility Features

1. **ARIA Attributes**: All charts include proper ARIA roles and labels for screen reader support
2. **Keyboard Navigation**: Charts are keyboard-accessible with `tabindex="0"` 
3. **Screen Reader Support**: Semantic HTML and ARIA attributes provide context to assistive technologies
4. **Proper Labeling**: Legend items and tooltips are properly labeled for screen readers

### Using Accessibility Features

Each chart component accepts `ariaLabel` and `ariaDescribedBy` inputs:

```typescript
<ngx-bar-chart
  [data]="data"
  [categories]="categories"
  ariaLabel="Monthly revenue comparison showing sales and profit trends"
  ariaDescribedBy="chart-description"
/>

<p id="chart-description" class="sr-only">
  This bar chart shows revenue data from January to December,
  comparing sales (blue bars) and profit (green bars) metrics.
</p>
```

### Best Practices for Accessible Charts

- **Provide descriptive labels**: Use the `ariaLabel` input to describe what the chart represents
- **Add detailed descriptions**: Use `ariaDescribedBy` to reference a more detailed text description
- **Include axis labels**: Always provide meaningful `xLabel` and `yLabel` values
- **Use meaningful colors**: Ensure sufficient color contrast (charts use Unovis defaults which meet WCAG AA standards)
- **Keep legends visible**: Legends help all users, including those with color blindness

Example with comprehensive accessibility:

```typescript
@Component({
  template: `
    <ngx-line-chart
      [data]="salesData"
      [categories]="categories"
      xLabel="Month"
      yLabel="Revenue (USD)"
      ariaLabel="Annual sales performance chart"
      ariaDescribedBy="sales-chart-desc"
    />
    <p id="sales-chart-desc" class="visually-hidden">
      Line chart showing monthly sales from January to December 2024.
      Sales started at $45,000 in January and increased to $62,000 by December,
      with a peak of $68,000 in July.
    </p>
  `
})
```

### Screen Reader Announcements

Charts include the following ARIA attributes:
- `role="img"` - Identifies the chart as an image for screen readers
- `aria-label` - Provides a text label for the chart
- `aria-describedby` - Points to a detailed description
- `aria-hidden="true"` - Hides decorative SVG elements from screen readers
- `role="list"` - Marks legend containers as lists
- `role="tooltip"` - Identifies tooltip content

## Documentation

For full documentation and examples, visit [angularcharts.com/docs](https://angularcharts.com/docs).

For the website, visit [angularcharts.com](https://angularcharts.com/).

For the repository, visit the [main GitHub page](https://github.com/dennisadriaansen/angular-chrts).
