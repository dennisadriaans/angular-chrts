# Area Chart Component Refactor Plan
**Date:** 31 January 2026  
**Component:** `projects/lib/src/lib/area-chart/area-chart.component.ts`  
**Analyzer:** Claude

---

## Executive Summary

The AreaChartComponent is a well-structured Angular component that wraps the Unovis chart library. While it demonstrates solid architectural patterns (signals, computed properties, effects), there are several opportunities for improvement in terms of maintainability, testability, performance, and code organization.

**Key Metrics:**
- Total Lines: 627
- Inputs: 34
- Outputs: 1
- Private Methods: 19
- State Management: Mixed (Signals + Unovis instances)

---

## Analysis

### Strengths

1. **Modern Angular Patterns**
   - Excellent use of Angular signals and computed properties
   - Proper use of `ChangeDetectionStrategy.OnPush`
   - Leverages `DestroyRef` for cleanup

2. **Clear Separation of Concerns**
   - Well-organized method grouping with comments
   - Distinct separation between stacked and non-stacked logic

3. **Type Safety**
   - Generic type parameter `<T extends Record<string, any>>`
   - Strong typing throughout

4. **SSR Compatibility**
   - Proper `isPlatformBrowser` checks

### Weaknesses

1. **Component Size & Complexity**
   - 627 lines in a single file
   - Too many responsibilities (chart creation, updates, legend, tooltip, event handling)
   - 34 inputs create a large API surface

2. **Duplication & Code Smell**
   - Similar logic repeated for stacked vs non-stacked modes
   - Configuration building logic scattered across multiple methods
   - Repeated accessor creation patterns

3. **State Management Issues**
   - Mixed state paradigm (signals for some, private properties for Unovis instances)
   - No clear state machine for chart lifecycle
   - Mutation of arrays (`this.areas.push()`, `this.lines.push()`)

4. **Testing Challenges**
   - Direct DOM manipulation makes unit testing difficult
   - Tightly coupled to Unovis library
   - Hard to mock chart instances

5. **Performance Concerns**
   - Multiple effects that could trigger unnecessary work
   - No memoization of expensive computed values
   - Potential over-rendering with `cdr.detectChanges()` in crosshair handler

6. **Type Safety Gaps**
   - `Record<string, unknown>` return types lose type information
   - `any` type in generic extends clause
   - Loose typing in configuration objects

---

## Refactoring Strategy

### Phase 1: Extract Services & Utilities (Priority: HIGH)

**Goal:** Reduce component size and improve testability

#### 1.1 Create Chart Configuration Service

**File:** `area-chart/services/area-chart-config.service.ts`

**Responsibilities:**
- Build Unovis configuration objects
- Manage gradient and marker SVG generation
- Color and style calculations

**Benefits:**
- Easier to test configuration logic in isolation
- Reusable across similar chart types
- Reduces component complexity

**Extraction Candidates:**
```typescript
- buildXAxisConfig()
- buildYAxisConfig()
- buildContainerConfig()
- createStackedYAccessors()
- createCumulativeYAccessors()
- getGradientId()
- svgDefs (computed)
- markerSvgDefs (computed)
- markerCssVars (computed)
```

#### 1.2 Create Chart Lifecycle Manager

**File:** `area-chart/services/area-chart-lifecycle.service.ts`

**Responsibilities:**
- Manage Unovis instance creation and destruction
- Handle stacked vs non-stacked component creation
- Coordinate updates across areas, lines, axes

**Benefits:**
- Encapsulates complex lifecycle logic
- Easier to add new chart variants
- Better separation of concerns

**Extraction Candidates:**
```typescript
- initializeChart()
- updateChart()
- destroyChart()
- createNonStackedComponents()
- createStackedComponents()
- updateNonStackedComponents()
- updateStackedComponents()
- createAxes()
- updateAxes()
- createTooltip()
```

#### 1.3 Create Legend Manager Service

**File:** `area-chart/services/legend-manager.service.ts`

**Responsibilities:**
- Legend initialization and updates
- Legend positioning logic

**Benefits:**
- Can be shared with other chart types
- Isolated testing of legend behavior

**Extraction Candidates:**
```typescript
- updateLegend()
- legendAlignment (computed)
- legendItems (computed)
- isLegendTop (computed)
```

---

### Phase 2: Introduce State Management Pattern (Priority: HIGH)

**Goal:** Establish consistent, predictable state management

#### 2.1 Create Chart State Store

**File:** `area-chart/state/area-chart.store.ts`

**Pattern:** Signal-based store similar to NgRx SignalStore

```typescript
export interface AreaChartState<T> {
  // Unovis instances
  container: XYContainer<T> | null;
  areas: Area<T>[];
  lines: Line<T>[];
  xAxis: Axis<T> | null;
  yAxis: Axis<T> | null;
  crosshair: Crosshair<T> | null;
  tooltip: Tooltip | null;
  legend: BulletLegend | null;
  
  // UI state
  hoverValues: T | undefined;
  isInitialized: boolean;
  
  // Configuration cache
  lastKeys: string[];
  lastColors: string[];
}
```

**Benefits:**
- Single source of truth
- Predictable state updates
- Better debugging with state snapshots
- Easier to add undo/redo or time-travel debugging

---

### Phase 3: Type System Improvements (Priority: MEDIUM)

**Goal:** Eliminate type safety gaps and improve IntelliSense

#### 3.1 Create Strict Configuration Types

**File:** `area-chart/types/area-chart-config.types.ts`

```typescript
export interface AxisConfig<T> {
  type: 'x' | 'y';
  position?: Position;
  label?: string;
  labelMargin?: number;
  numTicks?: number;
  tickFormat?: AxisFormatter;
  tickValues?: number[];
  gridLine?: boolean;
  domainLine?: boolean;
  tickLine?: boolean;
  minMaxTicksOnly?: boolean;
}

export interface ContainerConfig<T> {
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  yDomain?: [number, number];
  xDomain?: [number, number];
  components: Array<Area<T> | Line<T>>;
  xAxis?: Axis<T>;
  yAxis?: Axis<T>;
  crosshair?: Crosshair<T>;
  tooltip?: Tooltip;
}
```

**Benefits:**
- Better IDE autocomplete
- Catch configuration errors at compile time
- Self-documenting code

#### 3.2 Strengthen Generic Constraints

Replace:
```typescript
<T extends Record<string, any>>
```

With:
```typescript
<T extends Record<string, number | string | Date>>
```

**Rationale:** Chart data typically contains numeric, string, or date values. This prevents accidental usage with incompatible data types.

---

### Phase 4: Performance Optimizations (Priority: MEDIUM)

#### 4.1 Optimize Effect Triggers

**Current Issue:** Effects may run on every input change

**Solution:**
- Use `computed()` more aggressively to memoize expensive calculations
- Introduce dependency tracking for effects
- Use `untracked()` for non-reactive reads

```typescript
// Before
effect(() => {
  const container = this.chartContainer();
  const data = this.data();
  // ... uses many other inputs
});

// After
private readonly chartUpdateSignals = computed(() => ({
  container: this.chartContainer(),
  data: this.data(),
  categories: this.categories(),
  stacked: this.stacked(),
  // ... other dependencies
}));

effect(() => {
  const deps = this.chartUpdateSignals();
  // Effect only runs when chartUpdateSignals changes
});
```

#### 4.2 Debounce Chart Updates

For rapid input changes (e.g., during slider interactions), debounce updates:

```typescript
private readonly debouncedUpdate = debounce(() => {
  this.updateContainer(this.data());
}, 16); // ~60fps
```

#### 4.3 Optimize Change Detection

Replace `cdr.detectChanges()` with `cdr.markForCheck()` where possible:

```typescript
// Before
this.hoverValues.set(d);
this.cdr.detectChanges(); // Synchronous, can be expensive

// After
this.hoverValues.set(d);
this.cdr.markForCheck(); // Schedules check for next cycle
```

---

### Phase 5: Improve Input Organization (Priority: LOW)

**Goal:** Make the component API more intuitive and discoverable

#### 5.1 Group Related Inputs with Config Objects

Instead of 34 flat inputs, group them:

```typescript
// Axis configuration
readonly xAxisConfig = input<AxisInputConfig>({
  label: undefined,
  formatter: undefined,
  numTicks: undefined,
  // ...
});

readonly yAxisConfig = input<AxisInputConfig>({
  // ...
});

// Chart appearance
readonly appearance = input<AppearanceConfig>({
  height: 400,
  padding: { top: 5, right: 5, bottom: 30, left: 40 },
  curveType: undefined,
  lineWidth: 2,
  // ...
});

// Legend configuration
readonly legendConfig = input<LegendConfig>({
  hidden: false,
  position: LegendPosition.BottomCenter,
  style: undefined,
});
```

**Benefits:**
- Easier to understand related settings
- Better for documentation
- Simpler to add new related properties
- Backward compatible (keep flat inputs deprecated)

---

### Phase 6: Enhanced Error Handling (Priority: MEDIUM)

**Goal:** Provide better developer experience with helpful error messages

#### 6.1 Input Validation Service

**File:** `area-chart/validators/input-validator.service.ts`

```typescript
export class AreaChartInputValidator {
  validate(config: AreaChartInputs): ValidationResult {
    const errors: string[] = [];
    
    if (!config.data || config.data.length === 0) {
      errors.push('Data array cannot be empty');
    }
    
    if (!config.categories || Object.keys(config.categories).length === 0) {
      errors.push('At least one category must be defined');
    }
    
    // Validate category keys exist in data
    const dataKeys = new Set(Object.keys(config.data[0] ?? {}));
    const categoryKeys = Object.keys(config.categories);
    const missingKeys = categoryKeys.filter(k => !dataKeys.has(k));
    
    if (missingKeys.length > 0) {
      errors.push(`Category keys not found in data: ${missingKeys.join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  }
}
```

#### 6.2 Console Warnings for Common Mistakes

Add development-mode warnings:

```typescript
if (isDevMode()) {
  if (this.hideArea() && this.stacked()) {
    console.warn('hideArea() has no effect in stacked mode');
  }
  
  if (this.gradientStops().length < 2) {
    console.warn('gradientStops should have at least 2 stops for proper gradients');
  }
}
```

---

### Phase 7: Testing Infrastructure (Priority: HIGH)

**Goal:** Make component testable and add comprehensive test coverage

#### 7.1 Create Test Fixtures

**File:** `area-chart/testing/area-chart.fixtures.ts`

```typescript
export const mockAreaChartData = [
  { date: '2024-01', revenue: 100, expenses: 80 },
  { date: '2024-02', revenue: 150, expenses: 90 },
  // ...
];

export const mockCategories = {
  revenue: { name: 'Revenue', color: '#3b82f6' },
  expenses: { name: 'Expenses', color: '#ef4444' },
};

export class MockUnovisContainer {
  updateContainer = jasmine.createSpy('updateContainer');
  setData = jasmine.createSpy('setData');
  destroy = jasmine.createSpy('destroy');
}
```

#### 7.2 Component Test Strategy

```typescript
describe('AreaChartComponent', () => {
  describe('Input Validation', () => {
    // Test edge cases, invalid inputs
  });
  
  describe('Stacked Mode', () => {
    // Test stacked-specific logic
  });
  
  describe('Non-Stacked Mode', () => {
    // Test non-stacked logic
  });
  
  describe('Dynamic Updates', () => {
    // Test data changes, category changes
  });
  
  describe('Accessibility', () => {
    // Test ARIA attributes, keyboard navigation
  });
});
```

---

### Phase 8: Documentation & Developer Experience (Priority: LOW)

#### 8.1 JSDoc Improvements

Add comprehensive JSDoc for all inputs:

```typescript
/**
 * The data to be displayed in the chart.
 * 
 * @remarks
 * Each object in the array represents a data point. The keys should match
 * the category keys defined in the `categories` input.
 * 
 * @example
 * ```typescript
 * [
 *   { month: 'Jan', sales: 100, revenue: 200 },
 *   { month: 'Feb', sales: 150, revenue: 250 }
 * ]
 * ```
 */
readonly data = input.required<T[]>();
```

#### 8.2 Storybook Stories

Create comprehensive Storybook stories showcasing:
- Basic usage
- Stacked vs non-stacked
- Custom styling
- Multiple categories
- Custom formatters
- Responsive behavior

---

## Implementation Roadmap

### Sprint 1 (Week 1-2): Foundation
- [ ] Create service structure
- [ ] Extract ChartConfigService
- [ ] Set up testing infrastructure
- [ ] Add input validation

### Sprint 2 (Week 3-4): State & Lifecycle
- [ ] Implement AreaChartStore
- [ ] Extract ChartLifecycleManager
- [ ] Refactor component to use services

### Sprint 3 (Week 5-6): Optimization & Types
- [ ] Implement performance optimizations
- [ ] Add strict types
- [ ] Optimize effects and change detection

### Sprint 4 (Week 7-8): Polish
- [ ] Extract LegendManager
- [ ] Add comprehensive tests
- [ ] Documentation and Storybook

---

## Migration Strategy

To ensure backward compatibility:

1. **Parallel Implementation**
   - Keep existing component working
   - Build new architecture alongside
   - Use feature flags to toggle between implementations

2. **Deprecation Path**
   - Mark old flat inputs as deprecated
   - Provide migration guide
   - Support both APIs for 2 major versions

3. **Testing Strategy**
   - Ensure visual regression tests pass
   - Maintain API compatibility layer
   - Document breaking changes clearly

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking existing consumers | High | Medium | Maintain backward compatibility, comprehensive testing |
| Performance regression | High | Low | Benchmark before/after, load testing |
| Increased complexity | Medium | Medium | Clear documentation, gradual rollout |
| Unovis API changes | Medium | Low | Version locking, wrapper abstraction |

---

## Success Metrics

- [ ] Reduce component LOC by 40% (627 → ~375)
- [ ] Achieve 80%+ test coverage
- [ ] Zero breaking changes for existing consumers
- [ ] Improve bundle size (target: <5% increase)
- [ ] Performance: Chart initialization <100ms for 100 data points
- [ ] Developer satisfaction: Positive feedback in code reviews

---

## Open Questions

1. **Should we support dynamic stacked/non-stacked switching?**
   - Current implementation recreates entire chart
   - Could optimize with component pooling

2. **Is the current color API (string | string[]) too flexible?**
   - Consider strict gradient type vs simple color

3. **Should legend be a separate component?**
   - Better reusability
   - More complex API

4. **Do we need undo/redo for interactive charts?**
   - State store makes this possible
   - But is it a requirement?

---

## Conclusion

The AreaChartComponent is functionally solid but suffers from typical "grown organically" issues: too many responsibilities, unclear state management, and testing challenges. The proposed refactor addresses these issues systematically while maintaining backward compatibility.

**Priority Order:**
1. **High:** Extract services, add tests, implement state store
2. **Medium:** Performance optimizations, error handling, strict types
3. **Low:** Input reorganization, documentation improvements

**Estimated Effort:** 6-8 weeks with 1-2 developers

**Risk Level:** Medium (high value, manageable risk with proper testing)
