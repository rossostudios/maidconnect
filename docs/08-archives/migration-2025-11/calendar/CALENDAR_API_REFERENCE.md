# Calendar API Reference

Quick reference for the unified calendar system.

## Hooks

### useCalendarMonth

```typescript
import { useCalendarMonth } from "@/hooks/use-calendar-month";

const {
  currentMonth,        // Date - First day of current month
  goToNextMonth,       // () => void - Navigate forward
  goToPreviousMonth,   // () => void - Navigate backward
  goToToday,          // () => void - Jump to current month
  goToMonth,          // (date: Date) => void - Jump to specific month
  changeMonth,        // (offset: number) => void - Change by offset
  monthLabel,         // string - Formatted month label
  getMonthLabel,      // (locale?, options?) => string
  getMonthBounds,     // () => { startOfMonth, endOfMonth }
} = useCalendarMonth(initialDate?);
```

### useAvailabilityData

```typescript
import { useAvailabilityData } from "@/hooks/use-availability-data";

const {
  data,                    // AvailabilityData | null
  loading,                 // boolean
  error,                   // Error | null
  refetch,                 // () => Promise<void>
  getDateAvailability,     // (date: Date) => DayAvailability | null
} = useAvailabilityData({
  professionalId?: string,
  startDate: string,       // YYYY-MM-DD
  endDate: string,         // YYYY-MM-DD
  enabled?: boolean,
  onSuccess?: (data) => void,
  onError?: (error) => void,
});
```

### useCalendarGrid

```typescript
import { useCalendarGrid } from "@/hooks/use-calendar-grid";

const calendarDays = useCalendarGrid({
  currentMonth: Date,
  useUTC?: boolean,       // Default: false
  weeks?: number,         // Default: 6
});

// Returns: CalendarDay[]
// {
//   date: Date,
//   label: number,
//   key: string,
//   inCurrentMonth: boolean,
//   isToday: boolean,
//   isPast: boolean,
// }
```

## Components

### AvailabilityCalendar

```typescript
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";

<AvailabilityCalendar
  // Data source (required)
  dataSource={{
    type: "api",
    professionalId: string,
    onDataLoad?: (data: AvailabilityData) => void,
  }}
  // OR
  dataSource={{
    type: "props",
    availability: DayAvailability[],
    getDateAvailability: (date: Date) => DayAvailability | null,
  }}

  // Visual variants
  size?: "compact" | "medium" | "large"         // Default: "medium"
  theme?: "default" | "professional" | "customer" // Default: "default"

  // State (controlled)
  selectedDate?: Date | null
  onDateSelect?: (date: Date | null) => void
  selectedTime?: string | null
  onTimeSelect?: (time: string | null) => void

  // Features
  showTimeSlots?: boolean     // Default: true
  showLegend?: boolean        // Default: true
  showTodayButton?: boolean   // Default: true

  // Localization
  locale?: string             // Default: "en-US"
  useUTC?: boolean           // Default: false

  // Customization
  className?: string
  initialMonth?: Date
  renderDayContent?: (date: Date, availability: DayAvailability | null) => ReactNode
  renderTimeSlot?: (time: string, isSelected: boolean) => ReactNode
/>
```

## Types

### DayAvailability

```typescript
type DayAvailability = {
  date: string;           // YYYY-MM-DD
  status: "available" | "limited" | "booked" | "blocked";
  availableSlots: string[];
  bookingCount: number;
  maxBookings: number;
};
```

### AvailabilityData

```typescript
type AvailabilityData = {
  professionalId: string;
  startDate: string;
  endDate: string;
  availability: DayAvailability[];
  instantBooking?: {
    enabled: boolean;
    settings: Record<string, any>;
  };
};
```

### CalendarDay

```typescript
type CalendarDay = {
  date: Date;
  label: number;
  key: string;           // YYYY-MM-DD for React keys
  inCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};
```

## Common Patterns

### Pattern 1: Basic Booking Calendar

```typescript
function BookingCalendar({ professionalId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <AvailabilityCalendar
      dataSource={{ type: "api", professionalId }}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      selectedTime={selectedTime}
      onTimeSelect={setSelectedTime}
    />
  );
}
```

### Pattern 2: Custom Size & Theme

```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId: "123" }}
  size="large"
  theme="professional"
  showTimeSlots={false}
/>
```

### Pattern 3: Custom Data Source

```typescript
const availability = useMemo(() => [
  { date: "2025-01-15", status: "available", ... },
  // ... more days
], []);

const getAvailability = useCallback((date) => {
  const dateStr = formatDate(date);
  return availability.find(a => a.date === dateStr) || null;
}, [availability]);

<AvailabilityCalendar
  dataSource={{
    type: "props",
    availability,
    getDateAvailability: getAvailability,
  }}
/>
```

### Pattern 4: Custom Rendering

```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId: "123" }}
  size="large"
  renderDayContent={(date, availability) => (
    <div className="custom-day">
      <div className="date">{date.getDate()}</div>
      {availability && (
        <div className="slots">{availability.availableSlots.length}</div>
      )}
    </div>
  )}
  renderTimeSlot={(time, isSelected) => (
    <button className={isSelected ? "selected" : ""}>
      {formatTime(time)}
    </button>
  )}
/>
```

### Pattern 5: Localization

```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId: "123" }}
  locale="es-CO"
/>
```

### Pattern 6: UTC Calendar

```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId: "123" }}
  useUTC={true}
/>
```

## Size Comparison

| Feature | compact | medium | large |
|---------|---------|--------|-------|
| Day cell height | 50px | 60px | 120px |
| Header text | text-base | text-lg | text-4xl |
| Day number | text-sm | text-sm | text-2xl |
| Best for | Sidebars | Default | Hero sections |

## Theme Comparison

| Feature | default | professional | customer |
|---------|---------|--------------|----------|
| Selected style | Ring inset | Ring + border | Scale + ring offset |
| Today style | Font bold | Bold + color | Border color |
| Hover | Ring on hover | Border on hover | Scale + shadow |
| Best for | General use | Dashboards | Booking flows |

## Migration Cheatsheet

| Old Component | New Component | Changes |
|---------------|---------------|---------|
| `booking/availability-calendar.tsx` | `booking/availability-calendar-v2.tsx` | None (same API) |
| `bookings/large-availability-calendar.tsx` | `bookings/large-availability-calendar-v2.tsx` | None (same API) |
| `availability/blocked-dates-calendar.tsx` | `availability/blocked-dates-calendar-v2.tsx` | None (same API) |

## Troubleshooting

### Calendar not showing data
- Check that `professionalId` is valid
- Verify API endpoint returns data in expected format
- Check browser console for errors
- Try using `onDataLoad` callback to inspect data

### Dates in wrong timezone
- Use `useUTC={true}` for server-rendered calendars
- Use `useUTC={false}` (default) for client-side calendars

### Custom rendering not working
- Ensure `renderDayContent` returns valid React element
- Check that function is memoized to avoid re-renders
- Verify availability data structure matches expected format

### Performance issues
- Memoize custom rendering functions
- Use `useMemo` for data transformations
- Consider disabling features not needed (legend, time slots)

## Best Practices

1. **Always memoize callbacks**
   ```typescript
   const handleDateSelect = useCallback((date) => {
     // ...
   }, [dependencies]);
   ```

2. **Use controlled state**
   ```typescript
   const [selectedDate, setSelectedDate] = useState(null);
   // Pass to component as props
   ```

3. **Handle errors gracefully**
   ```typescript
   dataSource={{
     type: "api",
     professionalId,
     onDataLoad: (data) => console.log("Loaded:", data),
   }}
   ```

4. **Type your custom renderers**
   ```typescript
   const renderDay = useCallback((
     date: Date,
     availability: DayAvailability | null
   ): React.ReactNode => {
     // ...
   }, []);
   ```

5. **Test different sizes/themes**
   - Test on mobile (use compact/medium)
   - Test on desktop (can use large)
   - Test accessibility (keyboard navigation)
