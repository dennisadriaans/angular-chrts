# Markers vs. Labels in AreaChart

The `AreaChartComponent` provides two distinct ways to highlight data points on your lines and areas: **SVG Markers** and **XY Labels**. Each has different strengths and ideal use cases.

## Comparison Overview

| Feature | SVG Markers (`markerConfig`) | XY Labels (`showLabels`) |
| :--- | :--- | :--- |
| **Technology** | SVG `<defs>` and CSS `marker` | Unovis `XYLabels` Component |
| **Customization** | Global per series / CSS variables | Per-point accessors |
| **Formatting** | Fixed shape (Circle, Square, etc.) | Custom text content |
| **"Marker Mode"** | No (Static SVG) | Yes (using `labelBackgroundColor`) |
| **Performance** | Excellent (Native browser rendering) | Good (Unovis managed) |
| **Interactivity** | Limited (Basic CSS `:hover`) | Rich (Events, Attributes, Logic) |

---

## 1. SVG Markers (`MarkerConfig`)

Markers are standard SVG markers defined in the `<defs>` section of the chart. They are lightweight and handled directly by the browser's rendering engine.

### Features
- Defined once in the `<defs>` and reused across all paths.
- Controlled via CSS variables (e.g., `--vis-marker-fill`, `--vis-marker-stroke`).
- Best for minimalist designs or high-density data where performance is critical.

### Usage Example
```typescript
markerConfig = {
  id: 'my-custom-markers',
  config: `
    <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4">
      <circle cx="4" cy="4" r="3" style="fill: var(--vis-marker-fill); stroke: white;" />
    </marker>
  `
}
```
```html
<ngx-area-chart
  [data]="data"
  [categories]="categories"
  [markerConfig]="markerConfig"
/>
```

---

## 2. XY Labels (`XYLabels`)

Labels are more powerful components that can render text, shapes, or interactive elements at data point coordinates. They support a "Marker Mode" which can effectively replace standard markers with more flexibility.

### Features
- **Per-Point Logic**: Change color, size, or text based on individual data values.
- **Marker Mode**: Set `labelBackgroundColor` and provide an empty `labelFormatter` to render dots that support Unovis interactivity.
- **Avoid Overlap**: Unovis `XYLabels` includes logic to manage label density.

### Use as Labels
```html
<ngx-area-chart
  [data]="data"
  [categories]="categories"
  [showLabels]="true"
  [labelFormatter]="(d) => d.value > 100 ? 'High' : ''"
/>
```

### "Marker Mode" (Interactive Dots)
To use labels as markers, set the background color and return an empty string for the label. This gives you dots that are more interactive than standard SVG markers.

```html
<ngx-area-chart
  [data]="data"
  [categories]="categories"
  [showLabels]="true"
  [labelFormatter]="() => ''"
  labelBackgroundColor="white"
  [labelColor]="(d) => d.categoryColor"
/>
```

---

## Tradeoffs

### When to use Markers:
- You need high performance for thousands of points.
- You have a simple, static design that doesn't change based on data values.
- You want to use complex custom SVG paths as dots.

### When to use Labels:
- You need to conditionally show text (e.g., only show the max value).
- You want to color-code individual points based on thresholds.
- you want to leverage Unovis's built-in label placement and avoid-collision algorithms.
- You need deep integration with click events or custom attributes per point.
