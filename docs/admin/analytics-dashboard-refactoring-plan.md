# Analytics Dashboard Refactoring Plan

**Date:** 2025-01-14
**Design Direction:** "Financial Terminal Meets Data Art"
**Aesthetic:** Precision with bold creative execution

---

## Current Issues

### Code Quality
- **525 lines** in single file (analytics-dashboard.tsx)
- Data fetching mixed with UI rendering
- Inline MetricCard component (not reusable)
- Manual table HTML (should use PrecisionDataTable)
- Complex calculation logic inline (lines 92-248)

### Design Issues
- ❌ Old beige/cream color scheme (`#ebe5d8`, `#7d7566`, `#E85D48`)
- ❌ Rounded corners (`rounded-2xl`) - not Precision
- ❌ Generic trend indicators (arrows: ↗ → ↘)
- ❌ Inconsistent fonts (missing Geist Sans/Mono)
- ❌ Basic loading state (just text)

---

## Bold Creative Direction

### "Financial Terminal Meets Data Art"

**Aesthetic Pillars:**
1. **Sharp Geometric Forms** - Zero rounded corners, precise angles
2. **Monospaced Data Supremacy** - Geist Mono for all numbers (inspired by Bloomberg)
3. **Gradient Accent Borders** - Orange gradients on borders (not fills) for emphasis
4. **Asymmetric Grid** - Featured metrics larger than secondary metrics
5. **Mini Sparklines** - Recharts integration for visual data context
6. **Staggered Animations** - Page load reveals with orchestrated timing

**Visual Language:**
- Ultra-high contrast (WCAG AAA)
- Dense information hierarchy
- Data-first design (numbers are heroes)
- Subtle motion on hover (chart highlights)
- Status indicated by border colors (not background fills)

---

## Component Architecture

### Phase 1: Extract Hooks & Utils

**1. `useAnalytics.ts` (Custom Hook)**
```typescript
export function useAnalytics(timeRange: TimeRange) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [cityMetrics, setCityMetrics] = useState<CityMetrics[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching logic extracted from component
  // Returns: { metrics, cityMetrics, categoryMetrics, isLoading, refresh }
}
```

**Benefits:**
- Separation of concerns (data vs UI)
- Reusable across components
- Easier testing
- ~200 lines extracted

---

### Phase 2: Create Presentation Components

**2. `StatCard.tsx` (Individual Metric Card)**

**Design:**
```
┌─────────────────────────────────────────┐
│ FILL RATE              [mini sparkline] │ ← Geist Sans UPPERCASE
│                                          │
│ 78.4%                            ↗ GOOD │ ← Geist Mono 48px + status
│                                          │
│ Booking requests accepted               │ ← Neutral-600 description
│                                          │
│ ────────────────────────────────────    │ ← Orange gradient border (bottom)
└─────────────────────────────────────────┘
```

**Features:**
- Recharts mini sparkline (last 7/30/90 days trend)
- Sharp corners (no rounding)
- Orange gradient border accent (bottom edge)
- Geist Mono for value
- Status badge (colored border + text)
- Hover: sparkline highlights

**Code Estimate:** ~100 lines

---

**3. `StatsContainer.tsx` (KPI Grid)**

**Layout (Asymmetric):**
```
┌───────────────────┬───────────────────┐
│                   │                   │
│   Featured KPI    │   Featured KPI    │  ← Larger (span 2 cols)
│   (Fill Rate)     │   (TTFB)          │
│                   │                   │
├───────────────────┼───────────────────┤
│  Repeat Rate      │  Active Pros      │  ← Smaller
└───────────────────┴───────────────────┘
```

**Features:**
- CSS Grid with asymmetric sizing
- Staggered reveal animation (animation-delay)
- Responsive breakpoints (sm/md/lg)

**Code Estimate:** ~80 lines

---

**4. `TimeRangeSelector.tsx` (Filter Buttons)**

**Design:**
```
[7D] [30D] [90D] [ALL TIME]
 ^^   ^^^^
active   hover
```

**Features:**
- Sharp rectangular buttons
- Active: Orange border + orange text
- Hover: Orange border transition
- Geist Sans uppercase

**Code Estimate:** ~60 lines

---

**5. `CityMetricsTable.tsx` (PrecisionDataTable Wrapper)**

**Columns:**
- City (sortable)
- Fill Rate (badge with border color)
- Avg TTFB (Geist Mono)
- Bookings (Geist Mono)
- Professionals (Geist Mono)

**Features:**
- Uses PrecisionDataTable component
- Custom badge helper (border-only design)
- Export to CSV
- Global search

**Code Estimate:** ~120 lines

---

**6. `CategoryMetricsTable.tsx` (PrecisionDataTable Wrapper)**

**Columns:**
- Category (sortable)
- Fill Rate (badge with border color)
- Bookings (Geist Mono)
- Avg Price (currency formatter, Geist Mono)

**Features:**
- Uses PrecisionDataTable component
- Currency formatting (COP)
- Export to CSV

**Code Estimate:** ~100 lines

---

**7. `analytics-dashboard-skeleton.tsx` (Loading State)**

**Design:**
- Pulse animation skeleton matching final layout
- Sharp rectangular blocks (no rounded)
- Neutral-200 with neutral-50 pulse

**Code Estimate:** ~40 lines

---

### Phase 3: Refactor Main Dashboard

**8. `analytics-dashboard.tsx` (Orchestrator)**

**Structure:**
```typescript
export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { metrics, cityMetrics, categoryMetrics, isLoading } = useAnalytics(timeRange);

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <StatsContainer metrics={metrics} />
      <PlatformOverview metrics={metrics} />
      <CityMetricsTable data={cityMetrics} />
      <CategoryMetricsTable data={categoryMetrics} />
    </div>
  );
}
```

**Simplified from 525 → ~80 lines**

---

## Recharts Integration

### Mini Sparkline Component

```typescript
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function MiniSparkline({ data, color = "#FF5200" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Data Shape:**
```typescript
const sparklineData = [
  { day: 1, value: 75.2 },
  { day: 2, value: 78.1 },
  { day: 3, value: 76.8 },
  // ... last 7/30/90 days
];
```

---

## Design System Compliance

### Colors (Precision Palette)

**From:**
```css
bg-[#fbfafa]     /* Old beige */
text-[#7d7566]   /* Old muted text */
border-[#ebe5d8] /* Old border */
bg-[#E85D48]     /* Old orange */
```

**To:**
```css
bg-white                /* Pure white backgrounds */
text-neutral-900        /* Deep black text */
text-neutral-700        /* Secondary text */
text-neutral-600        /* Muted text */
border-neutral-200      /* Sharp borders */
bg-orange-500           /* Electric orange accents */
text-orange-600         /* Orange text */
```

### Typography

**Headers:** Geist Sans, font-semibold, text-xs, uppercase, tracking-wider
**Values:** Geist Mono, font-semibold, text-3xl or text-5xl (featured)
**Descriptions:** Geist Sans, font-normal, text-sm
**Table Data:** Geist Mono, tracking-tighter

### Shapes

**Remove ALL rounded corners:**
```diff
- className="rounded-2xl border ..."
+ className="border ..."
```

**Add gradient borders (featured cards only):**
```css
border-b-2 border-b-orange-500
/* Or gradient via pseudo-element */
```

---

## Badge Design (Status Indicators)

### Current (Background Fill)
```jsx
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
  78.4%
</span>
```

### New (Border Only - Precision)
```jsx
<span className="border-2 border-green-600 text-green-700 px-2.5 py-1 font-semibold text-xs uppercase tracking-wider">
  78.4%
</span>
```

**Color Mapping:**
- **Good (≥70%):** `border-green-600 text-green-700`
- **Neutral (50-69%):** `border-yellow-600 text-yellow-700`
- **Poor (<50%):** `border-red-600 text-red-700`

---

## Animation Strategy

### Page Load (Staggered Reveal)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s both;
}
.stat-card:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s both;
}
.stat-card:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s both;
}
.stat-card:nth-child(4) {
  animation: fadeInUp 0.5s ease-out 0.4s both;
}
```

### Hover States

```css
.stat-card {
  transition: border-color 200ms ease;
}
.stat-card:hover {
  border-color: #FF5200;
}
```

---

## Code Reduction Estimate

| File | Before | After | Change |
|------|--------|-------|--------|
| analytics-dashboard.tsx | 525 | 80 | -445 lines (-85%) |
| useAnalytics.ts (new) | - | 200 | +200 |
| StatCard.tsx (new) | - | 100 | +100 |
| StatsContainer.tsx (new) | - | 80 | +80 |
| TimeRangeSelector.tsx (new) | - | 60 | +60 |
| CityMetricsTable.tsx (new) | - | 120 | +120 |
| CategoryMetricsTable.tsx (new) | - | 100 | +100 |
| MiniSparkline.tsx (new) | - | 40 | +40 |
| analytics-dashboard-skeleton.tsx (new) | - | 40 | +40 |
| **Total** | **525** | **820** | **+295 lines** |

**Net Impact:**
- ✅ Better separation of concerns (data vs UI)
- ✅ Reusable components (StatCard, TimeRangeSelector, etc.)
- ✅ Easier testing (isolated hooks and components)
- ✅ Consistent Precision design system
- ✅ Enhanced UX (sparklines, animations, loading states)
- ⚠️ +295 lines total (but modular and maintainable)

**Justification for increased LOC:**
Unlike Users/Disputes/Audit Logs (which were overly complex and reduced -50%), Analytics requires:
- Data visualization (Recharts sparklines)
- Complex calculations (trends, percentages, aggregations)
- Multiple data views (KPIs, city table, category table)
- Rich UX (animations, hover states, loading skeletons)

The refactoring prioritizes **maintainability** and **design quality** over pure LOC reduction.

---

## Implementation Order

### Sprint 1 (Foundation)
1. ✅ Create `useAnalytics.ts` hook (extract data fetching)
2. ✅ Create `TimeRangeSelector.tsx`
3. ✅ Create `analytics-dashboard-skeleton.tsx`

### Sprint 2 (KPI Cards)
4. ✅ Install Recharts (`bun add recharts`)
5. ✅ Create `MiniSparkline.tsx`
6. ✅ Create `StatCard.tsx` with Precision design
7. ✅ Create `StatsContainer.tsx` with asymmetric grid

### Sprint 3 (Tables)
8. ✅ Create `CityMetricsTable.tsx` using PrecisionDataTable
9. ✅ Create `CategoryMetricsTable.tsx` using PrecisionDataTable

### Sprint 4 (Integration)
10. ✅ Refactor `analytics-dashboard.tsx` to orchestrator
11. ✅ Add staggered animations
12. ✅ Test all time ranges (7d, 30d, 90d, all)
13. ✅ Run `bun run check` (lint/type check)

---

## Success Criteria

### Functionality
- ✅ All KPIs calculated correctly
- ✅ Time range filtering works
- ✅ City/category tables sortable, filterable, exportable
- ✅ Sparklines show accurate trends

### Design
- ✅ Zero rounded corners (100% Precision compliance)
- ✅ Geist Sans/Mono fonts throughout
- ✅ Neutral + Orange color palette (no beige/cream)
- ✅ WCAG AAA contrast ratios
- ✅ Sharp geometric stat cards with gradient borders
- ✅ Asymmetric grid layout

### Code Quality
- ✅ Separation of concerns (hooks, components, utils)
- ✅ TypeScript strict mode (no `any`)
- ✅ Zero Biome lint errors
- ✅ Reusable components

### UX
- ✅ Smooth page load animations
- ✅ Responsive hover states
- ✅ Professional loading skeletons
- ✅ Instant filtering (client-side)

---

## Documentation Deliverables

1. **analytics-dashboard-refactoring-complete.md** - Final migration report
2. **Component README** - Usage examples for StatCard, StatsContainer
3. **Updated migration summary** - Add Analytics to overall metrics

---

**Next Step:** Begin Sprint 1 implementation with `useAnalytics.ts` hook extraction.
