# Calendar Import Update Guide

Quick reference for updating calendar imports from old to new V2 versions.

## Quick Command Reference

### Find All Calendar Imports
```bash
# Find pro-booking-calendar imports
git grep -n "from.*pro-booking-calendar\"" -- "*.tsx" "*.ts"

# Find professional-availability-calendar imports
git grep -n "from.*professional-availability-calendar\"" -- "*.tsx" "*.ts"

# Find all calendar component usage
git grep -n "ProBookingCalendar\|ProfessionalAvailabilityCalendar" -- "*.tsx" "*.ts"
```

## Files That Need Import Updates

### 1. Professional Dashboard Main Page

**File**: `/src/app/[locale]/dashboard/pro/page.tsx`

**Line 7 - Import Statement**:
```tsx
// OLD
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";

// NEW
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar-v2";
```

**Line 448 - Component Usage**:
```tsx
// No changes needed - component API is identical
<ProBookingCalendar
  bookings={bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduled_start: booking.scheduled_start,
    duration_minutes: booking.duration_minutes,
    amount_authorized: booking.amount_authorized,
    amount_captured: booking.amount_captured,
    currency: booking.currency,
  }))}
/>
```

### 2. Professional Bookings Page

**File**: `/src/app/[locale]/dashboard/pro/bookings/page.tsx`

**Line 2 - Import Statement**:
```tsx
// OLD
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";

// NEW
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar-v2";
```

**Line 64 - Component Usage**:
```tsx
// No changes needed - component API is identical
<ProBookingCalendar
  bookings={bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduled_start: booking.scheduled_start,
    duration_minutes: booking.duration_minutes,
    amount_authorized: booking.amount_authorized,
    amount_captured: booking.amount_captured,
    currency: booking.currency,
  }))}
/>
```

## Automated Update Script

You can use this script to update all imports at once:

```bash
#!/bin/bash

# Update pro-booking-calendar imports
sed -i '' 's|@/components/bookings/pro-booking-calendar"|@/components/bookings/pro-booking-calendar-v2"|g' \
  src/app/[locale]/dashboard/pro/page.tsx \
  src/app/[locale]/dashboard/pro/bookings/page.tsx

# Verify changes
echo "Updated files:"
git diff --name-only src/app/[locale]/dashboard/pro/

echo ""
echo "Review changes with: git diff src/app/[locale]/dashboard/pro/"
```

## Rollback Plan

If issues are discovered after deployment:

```bash
# Revert import changes
sed -i '' 's|@/components/bookings/pro-booking-calendar-v2"|@/components/bookings/pro-booking-calendar"|g' \
  src/app/[locale]/dashboard/pro/page.tsx \
  src/app/[locale]/dashboard/pro/bookings/page.tsx

# Or use git
git checkout HEAD -- src/app/[locale]/dashboard/pro/page.tsx
git checkout HEAD -- src/app/[locale]/dashboard/pro/bookings/page.tsx
```

## Testing Checklist

After updating imports, verify:

- [ ] Professional dashboard page loads (`/dashboard/pro`)
- [ ] Bookings page loads (`/dashboard/pro/bookings`)
- [ ] Calendar displays correctly
- [ ] Date selection works
- [ ] Booking count badges appear
- [ ] Sidebar shows booking details
- [ ] Currency formatting works
- [ ] Status translations work
- [ ] Month navigation works
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] No console errors
- [ ] Performance is acceptable

## Gradual Rollout Strategy

### Option 1: Feature Flag (Recommended)
```tsx
const USE_V2_CALENDAR = process.env.NEXT_PUBLIC_USE_V2_CALENDAR === 'true';

const CalendarComponent = USE_V2_CALENDAR
  ? ProBookingCalendarV2
  : ProBookingCalendar;

<CalendarComponent bookings={bookings} />
```

### Option 2: User-Based Rollout
```tsx
const CalendarComponent = user.betaFeatures?.includes('v2-calendar')
  ? ProBookingCalendarV2
  : ProBookingCalendar;

<CalendarComponent bookings={bookings} />
```

### Option 3: Percentage-Based Rollout
```tsx
const useV2Calendar = Math.random() < 0.1; // 10% rollout

const CalendarComponent = useV2Calendar
  ? ProBookingCalendarV2
  : ProBookingCalendar;

<CalendarComponent bookings={bookings} />
```

## Post-Deployment Monitoring

Watch for:
1. Error rates in calendar pages
2. Performance metrics (page load time, interaction time)
3. User feedback/reports
4. Console errors in browser
5. API request patterns (if using API-based calendar)

## Final Cleanup

After successful deployment (1-2 weeks of monitoring):

1. Remove old calendar files:
```bash
rm src/components/bookings/pro-booking-calendar.tsx
rm src/components/professionals/professional-availability-calendar.tsx
```

2. Rename V2 files to remove "-v2" suffix (optional):
```bash
mv src/components/bookings/pro-booking-calendar-v2.tsx \
   src/components/bookings/pro-booking-calendar.tsx

mv src/components/professionals/professional-availability-calendar-v2.tsx \
   src/components/professionals/professional-availability-calendar.tsx
```

3. Update imports to remove "-v2" suffix:
```bash
# Update all references
find src -type f -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i '' 's|pro-booking-calendar-v2|pro-booking-calendar|g'

find src -type f -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i '' 's|professional-availability-calendar-v2|professional-availability-calendar|g'
```

## Notes

- The V2 calendars have **identical APIs** to the originals
- No component usage code needs to change
- Only import paths need updating
- All functionality is preserved
- Performance should be similar or better
- Code is more maintainable going forward
