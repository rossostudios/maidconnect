# Availability Management

**Feature:** Professional calendar management and customer availability discovery
**Status:** ✅ Production
**Last Updated:** 2025-01-06
**Owner:** Product & Engineering Team

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Calendar System](#calendar-system)
5. [Instant Booking](#instant-booking)
6. [Time Slot Generation](#time-slot-generation)
7. [Double-Booking Prevention](#double-booking-prevention)
8. [UI Components](#ui-components)
9. [API Routes](#api-routes)
10. [Code Examples](#code-examples)
11. [Timezone Handling](#timezone-handling)
12. [Help Center Content](#help-center-content)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Future Enhancements](#future-enhancements)

---

## Overview

The **Availability Management** system allows cleaning professionals to:
- Set their working hours (weekly schedule)
- Block dates for vacations or personal time
- Configure instant booking with custom rules
- Manage buffer time between bookings
- Set maximum bookings per day

Customers can:
- View real-time availability on professional profiles
- See available time slots before booking
- Book instantly (if enabled by professional)
- See availability indicators (Available, Limited, Booked, Blocked)

### Key Features

✅ **Weekly Schedule Editor** - Set working hours for each day
✅ **Blocked Dates Calendar** - Mark vacation days and time off
✅ **Instant Booking** - Allow automatic booking confirmations
✅ **Buffer Time** - Prevent back-to-back bookings
✅ **Real-Time Availability** - Show current availability to customers
✅ **Conflict Prevention** - Automatic double-booking detection
✅ **Flexible Rules** - Configure lead time, max duration, max bookings per day

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AVAILABILITY MANAGEMENT                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌──────────────────────┐
│   PROFESSIONAL      │           │      CUSTOMER        │
│   Configuration     │           │   Booking Flow       │
└──────────┬──────────┘           └──────────┬───────────┘
           │                                  │
           │                                  │
    ┌──────▼──────────┐              ┌───────▼────────┐
    │  Weekly Hours   │              │  View Calendar │
    │  Editor         │              │                │
    └──────┬──────────┘              └───────┬────────┘
           │                                  │
    ┌──────▼──────────┐              ┌───────▼────────┐
    │  Blocked Dates  │              │ Select Date    │
    │  Calendar       │              │                │
    └──────┬──────────┘              └───────┬────────┘
           │                                  │
    ┌──────▼──────────┐              ┌───────▼────────┐
    │ Instant Booking │              │ Select Time    │
    │ Settings        │              │ Slot           │
    └──────┬──────────┘              └───────┬────────┘
           │                                  │
           │                                  │
           ▼                                  ▼
   ┌────────────────────────────────────────────────┐
   │        professional_profiles Table              │
   │  - availability_settings (JSONB)                │
   │  - blocked_dates (JSONB Array)                  │
   │  - instant_booking_enabled (Boolean)            │
   │  - instant_booking_settings (JSONB)             │
   └────────────────┬───────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────────────┐
   │       Time Slot Generation Logic                │
   │  1. Get working hours for date                  │
   │  2. Check blocked dates                         │
   │  3. Fetch existing bookings                     │
   │  4. Apply buffer time                           │
   │  5. Generate available slots (30-min intervals) │
   └────────────────┬───────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────────────┐
   │          Customer-Facing Calendar               │
   │  🟢 Available  🟡 Limited  🔴 Booked  ⚫ Blocked │
   └────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Database:** PostgreSQL (Supabase)
- **Storage:** JSONB for flexible availability settings
- **Validation:** Zod schemas for type safety
- **API:** Next.js 16 App Router API routes

**Frontend:**
- **Framework:** React 19.2 with Server Components
- **State:** React Query (@tanstack/react-query) for caching
- **Calendar:** Custom calendar grid hooks
- **Animations:** Motion One for smooth interactions

**Business Logic:**
- **Time Slot Calculation:** 30-minute increment algorithm
- **Conflict Detection:** Overlap checking with buffer zones
- **Status Calculation:** Available/Limited/Booked/Blocked logic

---

## Database Schema

### Professional Profiles Table

```sql
-- Fields in professional_profiles table
-- Added in migration: 20250102155000_add_booking_ux_features.sql

CREATE TABLE professional_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),

  -- Availability Configuration (JSONB)
  availability_settings jsonb DEFAULT '{}'::jsonb,

  -- Blocked Dates (JSONB Array)
  blocked_dates jsonb DEFAULT '[]'::jsonb,

  -- Instant Booking Feature
  instant_booking_enabled boolean DEFAULT false,
  instant_booking_settings jsonb DEFAULT '{}'::jsonb,

  -- Other fields...
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Availability Settings Structure (JSONB)

```typescript
interface AvailabilitySettings {
  working_hours: {
    monday?: WorkingPeriod[];
    tuesday?: WorkingPeriod[];
    wednesday?: WorkingPeriod[];
    thursday?: WorkingPeriod[];
    friday?: WorkingPeriod[];
    saturday?: WorkingPeriod[];
    sunday?: WorkingPeriod[];
  };
  buffer_time_minutes: number;        // Time between bookings (e.g., 30)
  max_bookings_per_day: number;       // Max concurrent bookings (e.g., 3)
  advance_booking_days: number;       // How far ahead customers can book (e.g., 60)
}

interface WorkingPeriod {
  start: string;  // "09:00" (HH:mm format)
  end: string;    // "17:00"
}

// Example:
{
  "working_hours": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }],
    "wednesday": [{ "start": "09:00", "end": "17:00" }],
    "thursday": [{ "start": "09:00", "end": "17:00" }],
    "friday": [{ "start": "09:00", "end": "17:00" }],
    "saturday": [{ "start": "10:00", "end": "14:00" }],
    "sunday": []  // Not working
  },
  "buffer_time_minutes": 30,
  "max_bookings_per_day": 3,
  "advance_booking_days": 60
}
```

### Instant Booking Settings Structure (JSONB)

```typescript
interface InstantBookingSettings {
  min_notice_hours: number;            // Minimum advance notice (e.g., 24)
  max_booking_duration_hours: number;  // Max duration for instant bookings (e.g., 8)
  auto_accept_recurring: boolean;      // Auto-accept recurring bookings
  only_verified_customers: boolean;    // Require customer verification
}

// Example:
{
  "min_notice_hours": 24,
  "max_booking_duration_hours": 8,
  "auto_accept_recurring": true,
  "only_verified_customers": false
}
```

### Blocked Dates Structure (JSONB Array)

```typescript
type BlockedDates = string[];  // Array of ISO date strings

// Example:
["2025-01-15", "2025-01-16", "2025-12-25"]
```

### Related Tables

**Bookings Table:**
```sql
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professional_profiles(id),
  scheduled_start timestamptz NOT NULL,  -- Used for conflict detection
  scheduled_end timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL,  -- Filter active bookings
  created_at timestamptz DEFAULT now()
);

-- Index for fast availability queries
CREATE INDEX idx_bookings_professional_scheduled
  ON bookings(professional_id, scheduled_start)
  WHERE status IN ('pending_payment', 'authorized', 'confirmed', 'in_progress');
```

---

## Calendar System

### Weekly Schedule Configuration

**Default Schedule** (Applied on First Setup):
```typescript
const DEFAULT_SCHEDULE: AvailabilitySettings = {
  working_hours: {
    monday: [{ start: "09:00", end: "17:00" }],
    tuesday: [{ start: "09:00", end: "17:00" }],
    wednesday: [{ start: "09:00", end: "17:00" }],
    thursday: [{ start: "09:00", end: "17:00" }],
    friday: [{ start: "09:00", end: "17:00" }],
    saturday: [],  // Weekend off by default
    sunday: []
  },
  buffer_time_minutes: 30,
  max_bookings_per_day: 3,
  advance_booking_days: 60
};
```

### Working Hours Flexibility

**Single Period Per Day:**
```typescript
monday: [{ start: "09:00", end: "17:00" }]
```

**Split Shifts** (Future Enhancement):
```typescript
monday: [
  { start: "09:00", end: "12:00" },  // Morning
  { start: "14:00", end: "17:00" }   // Afternoon (lunch break)
]
```

**Day Off:**
```typescript
sunday: []  // No working hours = day off
```

### Blocked Dates

**Purpose:**
- Vacation days
- Public holidays
- Personal time off
- Emergency unavailability

**Storage:**
```typescript
blocked_dates: ["2025-12-25", "2025-12-31", "2026-01-01"]
```

**Precedence:** Blocked dates override working hours (even if working hours are set, blocked dates take priority)

---

## Instant Booking

### Overview

**Instant Booking** allows customers to book without professional approval. The booking is automatically confirmed if:
1. Professional has instant booking enabled
2. Time slot is available
3. Meets minimum notice requirement (e.g., 24 hours)
4. Booking duration ≤ max instant booking duration
5. Customer meets verification requirements (if enabled)

### Configuration Options

**1. Minimum Notice Hours**
```typescript
min_notice_hours: 24  // Must book at least 24 hours in advance
```

**Use Case:** Prevents last-minute bookings that professionals can't prepare for.

**2. Maximum Booking Duration**
```typescript
max_booking_duration_hours: 8  // Instant bookings ≤ 8 hours
```

**Use Case:** Longer bookings may require approval to discuss scope.

**3. Auto-Accept Recurring Bookings**
```typescript
auto_accept_recurring: true  // Recurring bookings are instant
```

**Use Case:** Regular customers (weekly cleaning) get automatic acceptance.

**4. Require Verified Customers**
```typescript
only_verified_customers: false  // All customers can instant book
```

**Use Case:** High-trust professionals may require verified profiles only.

### Validation Logic

**File:** `/src/lib/availability.ts`

```typescript
export function canInstantBook(
  scheduledStart: Date,
  durationHours: number,
  settings: InstantBookingSettings,
  isRecurring = false
): { allowed: boolean; reason?: string } {
  const now = new Date();
  const hoursUntil = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // 1. Check minimum notice
  if (hoursUntil < settings.min_notice_hours) {
    return {
      allowed: false,
      reason: `Requires ${settings.min_notice_hours} hours notice`,
    };
  }

  // 2. Check maximum duration
  if (durationHours > settings.max_booking_duration_hours) {
    return {
      allowed: false,
      reason: `Maximum duration is ${settings.max_booking_duration_hours} hours`,
    };
  }

  // 3. Check recurring settings
  if (isRecurring && !settings.auto_accept_recurring) {
    return {
      allowed: false,
      reason: "Recurring bookings require approval",
    };
  }

  return { allowed: true };
}
```

### User Experience

**For Customers:**
- See "⚡ Instant Booking Available" badge on professional profiles
- Booking is confirmed immediately after payment
- No waiting for professional approval

**For Professionals:**
- Receive instant booking notification
- Can still cancel within cancellation policy window
- Get more bookings due to instant confirmation

---

## Time Slot Generation

### Algorithm Overview

**Goal:** Generate available time slots for a given date, considering:
1. Working hours for that day of week
2. Blocked dates (vacations)
3. Existing bookings
4. Buffer time between bookings
5. Maximum bookings per day

### Core Implementation

**File:** `/src/lib/availability.ts`

```typescript
export function generateTimeSlots(
  date: Date,
  settings: AvailabilitySettings,
  existingBookings: Booking[],
  blockedDates: string[],
  slotDurationMinutes = 60  // Default 1-hour slots
): string[] {
  // ========================================
  // STEP 1: Check if date is blocked
  // ========================================
  if (isDateBlocked(date, blockedDates)) {
    return [];  // No slots on blocked dates
  }

  // ========================================
  // STEP 2: Get working hours for this day
  // ========================================
  const dayName = getDayName(date);  // "monday", "tuesday", etc.
  const workingHours = settings.working_hours[dayName] || [];

  if (workingHours.length === 0) {
    return [];  // Not a working day
  }

  // ========================================
  // STEP 3: Initialize slot generation
  // ========================================
  const bufferTime = settings.buffer_time_minutes || 0;
  const slots: string[] = [];

  // ========================================
  // STEP 4: Generate slots for each working period
  // ========================================
  for (const period of workingHours) {
    const periodStart = timeToMinutes(period.start);  // "09:00" → 540
    const periodEnd = timeToMinutes(period.end);      // "17:00" → 1020

    // Generate slots in 30-minute increments
    for (let time = periodStart; time + slotDurationMinutes <= periodEnd; time += 30) {
      const slotStart = minutesToTime(time);  // 540 → "09:00"

      // ========================================
      // STEP 5: Check for conflicts with bookings
      // ========================================
      const hasConflict = existingBookings.some((booking) => {
        // Only check bookings on the same date
        const bookingDate = new Date(booking.scheduled_start);
        if (formatDate(bookingDate) !== formatDate(date)) {
          return false;
        }

        // Extract booking time window
        const bookingStart = new Date(booking.scheduled_start);
        const bookingEnd = new Date(booking.scheduled_end);

        const bookingStartMins = bookingStart.getHours() * 60 + bookingStart.getMinutes();
        const bookingEndMins = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

        // Add buffer time (e.g., 30 minutes before and after)
        const bufferedStart = bookingStartMins - bufferTime;
        const bufferedEnd = bookingEndMins + bufferTime;

        // Calculate slot time window
        const slotStartMins = time;
        const slotEndMins = time + slotDurationMinutes;

        // Check for overlap
        // No overlap if: slot ends before buffered booking OR slot starts after buffered booking
        const hasOverlap = !(slotEndMins <= bufferedStart || slotStartMins >= bufferedEnd);

        return hasOverlap;
      });

      // Add slot if no conflict
      if (!hasConflict) {
        slots.push(slotStart);
      }
    }
  }

  return slots;
}
```

### Helper Functions

**Convert Time String to Minutes:**
```typescript
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Example: "09:30" → 570
```

**Convert Minutes to Time String:**
```typescript
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Example: 570 → "09:30"
```

**Check if Date is Blocked:**
```typescript
function isDateBlocked(date: Date, blockedDates: string[]): boolean {
  const dateStr = formatDate(date);  // "2025-01-15"
  return blockedDates.includes(dateStr);
}
```

**Get Day Name:**
```typescript
function getDayName(date: Date): keyof WorkingHours {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()] as keyof WorkingHours;
}
```

### Time Slot Increments

**30-Minute Increments:**
```typescript
// Working hours: 09:00 - 17:00
// Generated slots (for 1-hour bookings):
[
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00"
]
// 16:30 excluded (16:30 + 60min = 17:30, exceeds 17:00 end time)
```

**Why 30-Minute Increments?**
- Flexibility for customers (more options)
- Common booking pattern (2-hour, 3-hour, 4-hour cleanings)
- Industry standard for service businesses

### Buffer Time Impact

**Without Buffer Time:**
```
09:00 - 11:00  Booking A
11:00 - 13:00  Booking B  ← Back-to-back (no break)
```

**With 30-Minute Buffer:**
```
09:00 - 11:00  Booking A
11:00 - 11:30  [BUFFER - Travel, Preparation]
11:30 - 13:30  Booking B  ← Professional has time to travel/prepare
```

**Buffer Time Calculation:**
```typescript
// Booking A: 09:00 - 11:00
// Buffer time: 30 minutes
// Buffered window: 08:30 - 11:30

// Time slot 11:00 (for 1-hour booking = 11:00 - 12:00)
// Slot window: 11:00 - 12:00
// Overlap check: Does 11:00-12:00 overlap with 08:30-11:30?
// Yes → 11:00 slot is blocked

// Time slot 11:30 (for 1-hour booking = 11:30 - 12:30)
// Slot window: 11:30 - 12:30
// Overlap check: Does 11:30-12:30 overlap with 08:30-11:30?
// No → 11:30 slot is available ✅
```

---

## Double-Booking Prevention

### Current Implementation

**Conflict Detection at Slot Generation:**
```typescript
// API Route: GET /api/professionals/[id]/availability
const { data: bookings } = await supabase
  .from("bookings")
  .select("scheduled_start, scheduled_end")
  .eq("professional_id", professionalId)
  .in("status", ["pending_payment", "authorized", "confirmed", "in_progress"])
  .gte("scheduled_start", startDate.toISOString())
  .lte("scheduled_start", endDate.toISOString());

// Generate slots excluding conflicting times
const slots = generateTimeSlots(date, settings, bookings || [], blockedDates);
```

**Active Booking Statuses** (Considered for Conflicts):
- `pending_payment` - Customer initiated booking, hasn't paid yet
- `authorized` - Payment authorized, awaiting confirmation
- `confirmed` - Booking confirmed by professional
- `in_progress` - Service currently happening

**Excluded Statuses** (Not Considered):
- `cancelled` - Customer cancelled
- `declined` - Professional declined
- `completed` - Service completed

### Identified Issue: Race Condition

**⚠️ CRITICAL GAP:**

The current implementation does NOT validate availability when creating a booking.

**Race Condition Scenario:**
```
10:00:00 - Customer A fetches availability → Sees 2pm slot available
10:00:01 - Customer B fetches availability → Sees 2pm slot available
10:00:05 - Customer A books 2pm slot → Booking created
10:00:07 - Customer B books 2pm slot → Booking created ❌ DOUBLE-BOOKED!
```

**Why This Happens:**

**File:** `/src/app/api/bookings/route.ts`
```typescript
export async function POST(request: Request) {
  // ... authentication ...

  const body = await request.json();
  const validated = BookingSchema.parse(body);

  // ❌ NO AVAILABILITY CHECK HERE
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      professional_id: validated.professional_id,
      scheduled_start: validated.scheduled_start,
      scheduled_end: validated.scheduled_end,
      // ...
    });

  if (error) throw error;
  return NextResponse.json({ booking });
}
```

### Recommended Solution

**Add Availability Validation Before Booking Creation:**

```typescript
export async function POST(request: Request) {
  // ... authentication and validation ...

  // ========================================
  // STEP 1: Fetch professional availability settings
  // ========================================
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('availability_settings, blocked_dates, instant_booking_enabled, instant_booking_settings')
    .eq('id', validated.professional_id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
  }

  // ========================================
  // STEP 2: Fetch existing bookings for the date
  // ========================================
  const bookingDate = new Date(validated.scheduled_start);
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('scheduled_start, scheduled_end')
    .eq('professional_id', validated.professional_id)
    .in('status', ['pending_payment', 'authorized', 'confirmed', 'in_progress'])
    .gte('scheduled_start', startOfDay.toISOString())
    .lte('scheduled_start', endOfDay.toISOString());

  // ========================================
  // STEP 3: Validate slot availability
  // ========================================
  const requestedStartTime = new Date(validated.scheduled_start);
  const startTimeStr = `${String(requestedStartTime.getHours()).padStart(2, '0')}:${String(requestedStartTime.getMinutes()).padStart(2, '0')}`;

  const availableSlots = generateTimeSlots(
    bookingDate,
    profile.availability_settings,
    existingBookings || [],
    profile.blocked_dates,
    validated.duration_minutes
  );

  if (!availableSlots.includes(startTimeStr)) {
    return NextResponse.json(
      { error: 'Time slot is no longer available' },
      { status: 409 }  // 409 Conflict
    );
  }

  // ========================================
  // STEP 4: Validate instant booking rules (if applicable)
  // ========================================
  if (profile.instant_booking_enabled) {
    const instantBookingCheck = canInstantBook(
      requestedStartTime,
      validated.duration_minutes / 60,
      profile.instant_booking_settings,
      validated.is_recurring
    );

    if (!instantBookingCheck.allowed) {
      return NextResponse.json(
        { error: instantBookingCheck.reason },
        { status: 400 }
      );
    }
  }

  // ========================================
  // STEP 5: Create booking (now validated)
  // ========================================
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      professional_id: validated.professional_id,
      scheduled_start: validated.scheduled_start,
      scheduled_end: validated.scheduled_end,
      duration_minutes: validated.duration_minutes,
      status: profile.instant_booking_enabled ? 'confirmed' : 'pending_payment',
      // ...
    });

  if (error) throw error;
  return NextResponse.json({ booking });
}
```

### Database-Level Prevention (Advanced)

**Use PostgreSQL Exclusion Constraint:**

```sql
-- Create extension for range types (if not exists)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping bookings
ALTER TABLE bookings
ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
  professional_id WITH =,
  tstzrange(scheduled_start, scheduled_end) WITH &&
) WHERE (status IN ('pending_payment', 'authorized', 'confirmed', 'in_progress'));
```

**How It Works:**
- `tstzrange(scheduled_start, scheduled_end)` creates a time range
- `WITH &&` checks for overlap
- `WHERE` clause only applies to active bookings
- Database rejects INSERT if overlap detected

**Error Handling:**
```typescript
try {
  const { data, error } = await supabase.from('bookings').insert(booking);
  if (error) throw error;
} catch (error) {
  if (error.code === '23P01') {  // Exclusion constraint violation
    return NextResponse.json(
      { error: 'Time slot is no longer available' },
      { status: 409 }
    );
  }
  throw error;
}
```

---

## UI Components

### 1. Availability Editor (Professional Dashboard)

**File:** `/src/components/availability/availability-editor.tsx`

**Purpose:** Main interface for professionals to manage availability

**Features:**
- Tabbed layout: "Working Hours" and "Blocked Dates"
- Real-time preview of changes
- Save/Cancel actions
- Loading states
- Error handling

**Usage:**
```tsx
import { AvailabilityEditor } from '@/components/availability/availability-editor';

export default function AvailabilitySettingsPage() {
  return (
    <div>
      <h1>Manage Your Availability</h1>
      <AvailabilityEditor />
    </div>
  );
}
```

**Component Structure:**
```tsx
'use client';

export function AvailabilityEditor() {
  const [activeTab, setActiveTab] = useState<'hours' | 'blocked'>('hours');
  const [weeklyHours, setWeeklyHours] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    const response = await fetch('/api/professional/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyHours,
        blockedDates,
      }),
    });

    if (response.ok) {
      toast.success('Availability updated');
    }

    setIsSaving(false);
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <WeeklyHoursEditor
            schedule={weeklyHours}
            onChange={setWeeklyHours}
          />
        </TabsContent>

        <TabsContent value="blocked">
          <BlockedDatesCalendar
            blockedDates={blockedDates}
            onChange={setBlockedDates}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </Card>
  );
}
```

---

### 2. Weekly Hours Editor

**File:** `/src/components/availability/weekly-hours-editor.tsx`

**Purpose:** Configure working hours for each day of the week

**Features:**
- ✅ **Quick Presets** - Weekdays, Weekends, Every Day
- ✅ **Per-Day Toggle** - Enable/disable individual days
- ✅ **Time Pickers** - Start and end times (24-hour format)
- ✅ **Copy to All** - Apply one day's hours to all days
- ✅ **Visual Summary** - Shows total working days

**Default Schedule:**
```typescript
const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
];
```

**Component Implementation:**
```tsx
interface DaySchedule {
  day: string;
  enabled: boolean;
  start: string;  // "09:00"
  end: string;    // "17:00"
}

interface WeeklyHoursEditorProps {
  schedule: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
}

export function WeeklyHoursEditor({ schedule, onChange }: WeeklyHoursEditorProps) {
  const applyPreset = (preset: 'weekdays' | 'weekends' | 'all') => {
    const updated = schedule.map((day) => {
      if (preset === 'weekdays') {
        return {
          ...day,
          enabled: !['Saturday', 'Sunday'].includes(day.day),
        };
      }
      if (preset === 'weekends') {
        return {
          ...day,
          enabled: ['Saturday', 'Sunday'].includes(day.day),
        };
      }
      return { ...day, enabled: true };  // 'all'
    });
    onChange(updated);
  };

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    onChange(updated);
  };

  const updateTime = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const copyToAll = (sourceIndex: number) => {
    const source = schedule[sourceIndex];
    const updated = schedule.map((day) => ({
      ...day,
      start: source.start,
      end: source.end,
    }));
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Presets */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => applyPreset('weekdays')}>
          Weekdays
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset('weekends')}>
          Weekends
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset('all')}>
          Every Day
        </Button>
      </div>

      {/* Day-by-Day Editor */}
      <div className="flex flex-col gap-4">
        {schedule.map((day, index) => (
          <div key={day.day} className="flex items-center gap-4">
            {/* Day Toggle */}
            <Switch
              checked={day.enabled}
              onCheckedChange={() => toggleDay(index)}
            />

            {/* Day Name */}
            <span className="w-24 text-sm font-medium">
              {day.day}
            </span>

            {/* Time Pickers */}
            {day.enabled ? (
              <>
                <input
                  type="time"
                  value={day.start}
                  onChange={(e) => updateTime(index, 'start', e.target.value)}
                  className="rounded-lg border px-3 py-2"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={day.end}
                  onChange={(e) => updateTime(index, 'end', e.target.value)}
                  className="rounded-lg border px-3 py-2"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToAll(index)}
                >
                  Copy to All
                </Button>
              </>
            ) : (
              <span className="text-gray-400">Not working</span>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium">Summary:</p>
        <p className="text-gray-600">
          Working {schedule.filter((d) => d.enabled).length} days per week
        </p>
      </div>
    </div>
  );
}
```

---

### 3. Blocked Dates Calendar

**File:** `/src/components/availability/blocked-dates-calendar.tsx`

**Purpose:** Mark specific dates as unavailable (vacations, holidays, personal time)

**Features:**
- ✅ **Month Navigation** - Previous/Next month
- ✅ **Click to Block/Unblock** - Toggle individual dates
- ✅ **Block Entire Month** - Vacation mode
- ✅ **Clear All** - Remove all blocked dates
- ✅ **Visual Indicators** - Red = blocked, white = available
- ✅ **Summary Stats** - Shows blocked dates count

**Component Implementation:**
```tsx
interface BlockedDatesCalendarProps {
  blockedDates: string[];  // ["2025-01-15", "2025-01-16"]
  onChange: (dates: string[]) => void;
}

export function BlockedDatesCalendar({ blockedDates, onChange }: BlockedDatesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = useCalendarGrid({ currentMonth, useUTC: false });

  const isBlocked = (date: Date): boolean => {
    const dateStr = formatDate(date);  // "2025-01-15"
    return blockedDates.includes(dateStr);
  };

  const toggleDate = (date: Date) => {
    const dateStr = formatDate(date);

    if (isBlocked(date)) {
      // Unblock
      onChange(blockedDates.filter((d) => d !== dateStr));
    } else {
      // Block
      onChange([...blockedDates, dateStr]);
    }
  };

  const blockEntireMonth = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
      return formatDate(date);
    });

    onChange([...new Set([...blockedDates, ...monthDates])]);
  };

  const clearAll = () => {
    onChange([]);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goToPreviousMonth}>
          Previous
        </Button>

        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>

        <Button variant="outline" onClick={goToNextMonth}>
          Next
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={blockEntireMonth}>
          Block Entire Month
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const blocked = day.date && isBlocked(day.date);
          const isCurrentMonth = day.date && day.date.getMonth() === currentMonth.getMonth();

          return (
            <button
              key={index}
              onClick={() => day.date && isCurrentMonth && toggleDate(day.date)}
              disabled={!day.date || !isCurrentMonth}
              className={cn(
                'h-12 rounded-lg text-sm transition-colors',
                {
                  'bg-red-100 text-red-900 hover:bg-red-200': blocked && isCurrentMonth,
                  'bg-white hover:bg-gray-50': !blocked && isCurrentMonth,
                  'text-gray-300': !isCurrentMonth,
                  'cursor-not-allowed': !day.date || !isCurrentMonth,
                }
              )}
            >
              {day.date?.getDate()}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium">Summary:</p>
        <p className="text-gray-600">
          {blockedDates.length} blocked dates
        </p>
        <p className="text-xs text-gray-500">
          Click dates to block/unblock
        </p>
      </div>
    </div>
  );
}
```

---

### 4. Customer-Facing Availability Calendar

**File:** `/src/components/shared/availability-calendar.tsx`

**Purpose:** Unified calendar component for customer booking flow

**Features:**
- ✅ **Three Sizes** - Compact, Medium, Large
- ✅ **Three Themes** - Default, Professional, Customer
- ✅ **Availability Indicators** - 🟢 Available, 🟡 Limited, 🔴 Booked, ⚫ Blocked
- ✅ **Time Slot Picker** - Shows available times when date selected
- ✅ **Responsive Grid** - 3-4 columns mobile, up to 6 desktop
- ✅ **Legend** - Explains status colors
- ✅ **API or Props Data** - Flexible data sources

**Availability Status Logic:**
```typescript
type AvailabilityStatus = 'available' | 'limited' | 'booked' | 'blocked';

function calculateDayStatus(
  date: Date,
  availableSlots: string[],
  bookingCount: number,
  maxBookings: number,
  blockedDates: string[]
): AvailabilityStatus {
  // 1. Blocked dates override everything
  if (isDateBlocked(date, blockedDates)) {
    return 'blocked';
  }

  // 2. Max bookings reached
  if (bookingCount >= maxBookings) {
    return 'booked';
  }

  // 3. No time slots available
  if (availableSlots.length === 0) {
    return 'booked';
  }

  // 4. Limited availability (≤2 slots OR ≥70% booked)
  if (availableSlots.length <= 2 || bookingCount >= maxBookings * 0.7) {
    return 'limited';
  }

  // 5. Available
  return 'available';
}
```

**Component Implementation:**
```tsx
interface AvailabilityCalendarProps {
  dataSource:
    | { type: 'api'; professionalId: string }
    | { type: 'props'; availability: DayAvailability[]; getDateAvailability: (date: Date) => DayAvailability | undefined };
  size?: 'compact' | 'medium' | 'large';
  theme?: 'default' | 'professional' | 'customer';
  selectedDate?: Date | null;
  selectedTime?: string | null;
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  showTimeSlots?: boolean;
  showLegend?: boolean;
}

export function AvailabilityCalendar({
  dataSource,
  size = 'medium',
  theme = 'default',
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  showTimeSlots = true,
  showLegend = true,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = useCalendarGrid({ currentMonth, useUTC: false });

  // Fetch availability (if using API)
  const { data: availability, isLoading } = useAvailabilityData({
    professionalId: dataSource.type === 'api' ? dataSource.professionalId : undefined,
    startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
  });

  const getAvailability = (date: Date): DayAvailability | undefined => {
    if (dataSource.type === 'props') {
      return dataSource.getDateAvailability(date);
    }
    return availability?.find((d) => formatDate(new Date(d.date)) === formatDate(date));
  };

  const handleDateClick = (date: Date) => {
    const dayAvailability = getAvailability(date);
    if (dayAvailability?.status === 'blocked' || dayAvailability?.status === 'booked') {
      return;  // Can't select blocked/booked dates
    }
    onDateSelect?.(date);
  };

  const selectedDayAvailability = selectedDate ? getAvailability(selectedDate) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          ← Previous
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          Next →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        'grid grid-cols-7 gap-2',
        {
          'gap-1': size === 'compact',
          'gap-2': size === 'medium',
          'gap-3': size === 'large',
        }
      )}>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          if (!day.date) {
            return <div key={index} />;  // Empty cell
          }

          const dayAvailability = getAvailability(day.date);
          const status = dayAvailability?.status || 'blocked';
          const isSelected = selectedDate && formatDate(day.date) === formatDate(selectedDate);
          const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.date!)}
              disabled={!isCurrentMonth || status === 'blocked' || status === 'booked'}
              className={cn(
                'rounded-lg text-sm font-medium transition-all',
                {
                  'h-10 text-xs': size === 'compact',
                  'h-12 text-sm': size === 'medium',
                  'h-16 text-base': size === 'large',
                },
                {
                  // Available
                  'bg-green-50 text-green-900 hover:bg-green-100': status === 'available' && !isSelected,
                  // Limited
                  'bg-yellow-50 text-yellow-900 hover:bg-yellow-100': status === 'limited' && !isSelected,
                  // Booked
                  'bg-red-50 text-red-400 cursor-not-allowed': status === 'booked',
                  // Blocked
                  'bg-gray-50 text-gray-300 cursor-not-allowed': status === 'blocked',
                  // Selected
                  'ring-2 ring-red-600 bg-red-50': isSelected,
                  // Not current month
                  'opacity-40': !isCurrentMonth,
                }
              )}
            >
              <div className="flex flex-col items-center">
                <span>{day.date.getDate()}</span>
                {size === 'large' && dayAvailability && (
                  <span className="text-xs text-gray-500">
                    {dayAvailability.availableSlots.length} slots
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Time Slot Picker */}
      {showTimeSlots && selectedDayAvailability && selectedDate && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium">
            Available times for {format(selectedDate, 'MMMM d, yyyy')}
          </h4>

          {selectedDayAvailability.availableSlots.length === 0 ? (
            <p className="text-sm text-gray-500">No available time slots</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {selectedDayAvailability.availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => onTimeSelect?.(time)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm transition-colors',
                      {
                        'border-red-600 bg-red-50 text-red-900': selectedTime === time,
                        'border-gray-200 hover:border-gray-300 hover:bg-gray-50': selectedTime !== time,
                      }
                    )}
                  >
                    {formatTime(time)}  {/* "09:00" → "9:00 AM" */}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                {selectedDayAvailability.bookingCount} of {selectedDayAvailability.maxBookings} slots booked today
              </p>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 rounded-lg bg-gray-50 p-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-50 border border-green-200" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-yellow-50 border border-yellow-200" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-50 border border-red-200" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-50 border border-gray-200" />
            <span>Blocked</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Usage in Booking Flow:**
```tsx
'use client';

import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { useState } from 'react';

export function BookingForm({ professionalId }: { professionalId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <h2>Select Date & Time</h2>

      <AvailabilityCalendar
        dataSource={{ type: 'api', professionalId }}
        size="medium"
        theme="customer"
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
        showTimeSlots={true}
        showLegend={true}
      />

      {selectedDate && selectedTime && (
        <Button onClick={handleBooking}>
          Book for {format(selectedDate, 'MMM d, yyyy')} at {formatTime(selectedTime)}
        </Button>
      )}
    </div>
  );
}
```

---

## API Routes

### GET `/api/professionals/[id]/availability`

**Purpose:** Fetch availability for a professional within a date range

**Authentication:** Public (no auth required)

**Query Parameters:**
- `startDate` (required) - Start date in YYYY-MM-DD format
- `endDate` (required) - End date in YYYY-MM-DD format

**Example Request:**
```typescript
const response = await fetch(
  `/api/professionals/abc123/availability?startDate=2025-01-01&endDate=2025-01-31`
);
const data = await response.json();
```

**Response:**
```typescript
{
  professionalId: "abc123",
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  availability: [
    {
      date: "2025-01-15",
      status: "available",
      availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", ...],
      bookingCount: 1,
      maxBookings: 3
    },
    {
      date: "2025-01-16",
      status: "limited",
      availableSlots: ["14:00", "14:30"],
      bookingCount: 2,
      maxBookings: 3
    },
    {
      date: "2025-01-17",
      status: "booked",
      availableSlots: [],
      bookingCount: 3,
      maxBookings: 3
    },
    {
      date: "2025-01-25",
      status: "blocked",
      availableSlots: [],
      bookingCount: 0,
      maxBookings: 0
    }
  ],
  instantBooking: {
    enabled: true,
    settings: {
      min_notice_hours: 24,
      max_booking_duration_hours: 8,
      auto_accept_recurring: true,
      only_verified_customers: false
    }
  }
}
```

**Implementation:**
```typescript
// /src/app/api/professionals/[id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { getAvailabilityForRange } from '@/lib/availability';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const professionalId = params.id;
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch professional availability settings
  const { data: profile, error: profileError } = await supabase
    .from('professional_profiles')
    .select('availability_settings, blocked_dates, instant_booking_enabled, instant_booking_settings')
    .eq('id', professionalId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Professional not found' },
      { status: 404 }
    );
  }

  // Fetch existing bookings in date range
  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_start, scheduled_end')
    .eq('professional_id', professionalId)
    .in('status', ['pending_payment', 'authorized', 'confirmed', 'in_progress'])
    .gte('scheduled_start', new Date(startDate).toISOString())
    .lte('scheduled_start', new Date(endDate).toISOString());

  // Generate availability for each day in range
  const availability = getAvailabilityForRange(
    new Date(startDate),
    new Date(endDate),
    profile.availability_settings,
    bookings || [],
    profile.blocked_dates
  );

  return NextResponse.json({
    professionalId,
    startDate,
    endDate,
    availability,
    instantBooking: {
      enabled: profile.instant_booking_enabled,
      settings: profile.instant_booking_settings,
    },
  });
}
```

---

### PUT `/api/professional/availability`

**Purpose:** Update professional's availability settings

**Authentication:** Required (authenticated professional)

**Request Body:**
```typescript
{
  weeklyHours?: DaySchedule[];   // Optional: Update working hours
  blockedDates?: string[];       // Optional: Update blocked dates
}

interface DaySchedule {
  day: string;       // "Monday", "Tuesday", etc.
  enabled: boolean;  // true = working, false = day off
  start: string;     // "09:00"
  end: string;       // "17:00"
}
```

**Example Request:**
```typescript
const response = await fetch('/api/professional/availability', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    weeklyHours: [
      { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
      { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
      // ...
    ],
    blockedDates: ['2025-12-25', '2025-12-31'],
  }),
});
```

**Response:**
```typescript
{
  success: true,
  message: "Availability updated successfully"
}
```

**Implementation:**
```typescript
// /src/app/api/professional/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { z } from 'zod';

const DayScheduleSchema = z.object({
  day: z.string(),
  enabled: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const UpdateAvailabilitySchema = z.object({
  weeklyHours: z.array(DayScheduleSchema).optional(),
  blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate request body
  const body = await request.json();
  const validated = UpdateAvailabilitySchema.parse(body);

  // Build update object
  const updates: Record<string, unknown> = {};

  if (validated.weeklyHours) {
    // Convert DaySchedule[] to working_hours object
    const workingHours: Record<string, WorkingPeriod[]> = {};

    for (const day of validated.weeklyHours) {
      const dayKey = day.day.toLowerCase();
      workingHours[dayKey] = day.enabled
        ? [{ start: day.start, end: day.end }]
        : [];
    }

    updates.availability_settings = {
      working_hours: workingHours,
      buffer_time_minutes: 30,
      max_bookings_per_day: 3,
      advance_booking_days: 60,
    };
  }

  if (validated.blockedDates !== undefined) {
    updates.blocked_dates = validated.blockedDates;
  }

  // Update database
  const { error } = await supabase
    .from('professional_profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Availability updated successfully',
  });
}
```

---

## Code Examples

### Example 1: Check if a Time Slot is Available

```typescript
import { isSlotAvailable } from '@/lib/availability';
import { createClient } from '@/lib/supabase/server-client';

export async function checkSlotAvailability(
  professionalId: string,
  date: Date,
  startTime: string,  // "10:00"
  durationMinutes: number
): Promise<boolean> {
  const supabase = await createClient();

  // Fetch professional settings
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('availability_settings, blocked_dates')
    .eq('id', professionalId)
    .single();

  if (!profile) {
    throw new Error('Professional not found');
  }

  // Fetch existing bookings for the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_start, scheduled_end')
    .eq('professional_id', professionalId)
    .in('status', ['pending_payment', 'authorized', 'confirmed', 'in_progress'])
    .gte('scheduled_start', startOfDay.toISOString())
    .lte('scheduled_start', endOfDay.toISOString());

  // Check availability
  return isSlotAvailable(
    date,
    startTime,
    durationMinutes,
    profile.availability_settings,
    bookings || [],
    profile.blocked_dates
  );
}

// Usage
const available = await checkSlotAvailability(
  'professional-id',
  new Date('2025-01-15'),
  '10:00',
  120  // 2 hours
);

if (available) {
  console.log('Time slot is available!');
} else {
  console.log('Time slot is not available');
}
```

---

### Example 2: Get Next Available Date

```typescript
import { getNextAvailableDate } from '@/lib/availability';

export async function findNextAvailableSlot(
  professionalId: string,
  searchDays = 30
): Promise<Date | null> {
  const supabase = await createClient();

  // Fetch professional settings
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('availability_settings, blocked_dates')
    .eq('id', professionalId)
    .single();

  if (!profile) return null;

  // Fetch bookings for next 30 days
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + searchDays);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_start, scheduled_end')
    .eq('professional_id', professionalId)
    .in('status', ['pending_payment', 'authorized', 'confirmed', 'in_progress'])
    .gte('scheduled_start', today.toISOString())
    .lte('scheduled_start', futureDate.toISOString());

  // Find next available date
  return getNextAvailableDate(
    profile.availability_settings,
    bookings || [],
    profile.blocked_dates,
    searchDays
  );
}

// Usage
const nextAvailable = await findNextAvailableSlot('professional-id', 30);

if (nextAvailable) {
  console.log(`Next available: ${nextAvailable.toLocaleDateString()}`);
} else {
  console.log('No availability in the next 30 days');
}
```

---

### Example 3: Validate Booking Before Creation

```typescript
export async function validateAndCreateBooking(
  professionalId: string,
  customerId: string,
  scheduledStart: Date,
  durationMinutes: number
): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  const supabase = await createClient();

  // 1. Fetch professional settings
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('availability_settings, blocked_dates, instant_booking_enabled, instant_booking_settings')
    .eq('id', professionalId)
    .single();

  if (!profile) {
    return { success: false, error: 'Professional not found' };
  }

  // 2. Check if date is blocked
  const dateStr = format(scheduledStart, 'yyyy-MM-dd');
  if (profile.blocked_dates.includes(dateStr)) {
    return { success: false, error: 'Professional is not available on this date' };
  }

  // 3. Fetch existing bookings
  const startOfDay = startOfDay(scheduledStart);
  const endOfDay = endOfDay(scheduledStart);

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('scheduled_start, scheduled_end')
    .eq('professional_id', professionalId)
    .in('status', ['pending_payment', 'authorized', 'confirmed', 'in_progress'])
    .gte('scheduled_start', startOfDay.toISOString())
    .lte('scheduled_start', endOfDay.toISOString());

  // 4. Generate available slots
  const availableSlots = generateTimeSlots(
    scheduledStart,
    profile.availability_settings,
    existingBookings || [],
    profile.blocked_dates,
    durationMinutes
  );

  const requestedTime = format(scheduledStart, 'HH:mm');
  if (!availableSlots.includes(requestedTime)) {
    return { success: false, error: 'Time slot is no longer available' };
  }

  // 5. Validate instant booking rules
  if (profile.instant_booking_enabled) {
    const instantBookingCheck = canInstantBook(
      scheduledStart,
      durationMinutes / 60,
      profile.instant_booking_settings,
      false
    );

    if (!instantBookingCheck.allowed) {
      return { success: false, error: instantBookingCheck.reason };
    }
  }

  // 6. Create booking
  const scheduledEnd = new Date(scheduledStart);
  scheduledEnd.setMinutes(scheduledEnd.getMinutes() + durationMinutes);

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      professional_id: professionalId,
      customer_id: customerId,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      duration_minutes: durationMinutes,
      status: profile.instant_booking_enabled ? 'confirmed' : 'pending_payment',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Failed to create booking' };
  }

  return { success: true, booking };
}
```

---

## Timezone Handling

### Current Implementation

**Storage:** All dates stored as `timestamptz` (PostgreSQL timezone-aware timestamps)

**Calendar Hooks:** Currently use local time (browser timezone)
```typescript
const calendarDays = useCalendarGrid({ currentMonth, useUTC: false });
```

**Display:** Times displayed in user's local timezone

### Identified Issue

**Problem:** No explicit timezone management for Colombia (COT = UTC-5)

**Scenarios:**
1. **Colombian professional, Colombian customer** → Works (same timezone)
2. **Colombian professional, US customer** → Confusing (different timezones)
3. **Traveling professional** → Incorrect times if timezone changes

### Recommended Solution

**1. Store Professional's Timezone:**
```sql
ALTER TABLE professional_profiles
ADD COLUMN timezone TEXT DEFAULT 'America/Bogota';
```

**2. Display Times in Professional's Timezone:**
```typescript
import { format, formatInTimeZone } from 'date-fns-tz';

export function formatProfessionalTime(
  date: Date,
  professionalTimezone: string
): string {
  return formatInTimeZone(date, professionalTimezone, 'h:mm a');
}

// Usage
<p>Available at {formatProfessionalTime(scheduledStart, 'America/Bogota')}</p>
// Output: "Available at 9:00 AM COT"
```

**3. Show Customer's Local Time with Indicator:**
```typescript
export function BookingTimeDisplay({
  scheduledStart,
  professionalTimezone
}: {
  scheduledStart: Date;
  professionalTimezone: string;
}) {
  const professionalTime = formatInTimeZone(
    scheduledStart,
    professionalTimezone,
    'h:mm a zzz'
  );

  const customerTime = format(scheduledStart, 'h:mm a zzz');

  return (
    <div>
      <p className="font-medium">{professionalTime}</p>
      {professionalTime !== customerTime && (
        <p className="text-sm text-gray-500">
          {customerTime} your time
        </p>
      )}
    </div>
  );
}

// Output:
// 9:00 AM COT
// 11:00 AM EST your time
```

**4. Convert API Requests to Professional's Timezone:**
```typescript
export async function GET(request: NextRequest) {
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('timezone, availability_settings')
    .eq('id', professionalId)
    .single();

  const professionalTimezone = profile.timezone || 'America/Bogota';

  // Convert dates to professional's timezone for accurate slot generation
  const availability = getAvailabilityForRange(
    startDate,
    endDate,
    profile.availability_settings,
    bookings,
    blockedDates,
    professionalTimezone  // ← Pass timezone
  );

  return NextResponse.json({ availability });
}
```

---

## Help Center Content

### For Customers

#### How do I see a professional's availability?

**Answer:**
1. Go to the professional's profile page
2. Scroll to the "Availability" section
3. You'll see a calendar with color-coded availability:
   - **🟢 Green (Available)** - Many time slots open
   - **🟡 Yellow (Limited)** - Few slots remaining
   - **🔴 Red (Booked)** - No slots available
   - **⚫ Gray (Blocked)** - Professional is not working

4. Click any green or yellow date to see available time slots
5. Select your preferred time and proceed with booking

---

#### What is instant booking?

**Answer:**
Instant booking allows you to book and confirm a cleaning service immediately without waiting for professional approval.

**When a professional has instant booking enabled:**
- Your booking is confirmed automatically after payment
- You receive immediate confirmation
- The professional receives a notification

**Benefits:**
- ✅ No waiting for approval
- ✅ Guaranteed confirmation
- ✅ Faster booking process

**Look for the ⚡ Instant Booking Available badge on professional profiles.**

---

#### Why can't I book a time I want?

**Possible reasons:**

**1. Time Slot Already Booked**
- Another customer may have just booked that time
- Try refreshing the page to see updated availability

**2. Minimum Notice Requirement**
- Some professionals require 24-48 hours advance notice
- Try booking for a later date

**3. Professional Not Working That Day**
- The professional may have blocked that date for vacation or personal time
- Check other available dates on the calendar

**4. Maximum Bookings Reached**
- The professional may have reached their daily booking limit
- Try a different date or earlier/later time

**5. Booking Duration Too Long**
- Some professionals limit instant bookings to shorter durations (e.g., 8 hours max)
- Contact the professional for longer bookings

---

#### How far in advance can I book?

**Answer:**
Most professionals allow bookings **up to 60 days in advance**.

**Minimum advance notice:**
- Typically **24 hours** for instant booking
- Some professionals may require **48 hours** or more
- Check the professional's profile for specific requirements

**Tip:** Book early for:
- Weekends (higher demand)
- Holidays (limited availability)
- Specific time preferences (morning/afternoon)

---

#### Can I see the professional's schedule?

**Answer:**
You can see **availability** (open time slots) but not the complete schedule.

**What you can see:**
- ✅ Available dates and times
- ✅ How many slots are left (Available/Limited/Booked)
- ✅ Which dates are blocked (vacation/time off)

**What you cannot see:**
- ❌ Other customers' booking times
- ❌ Professional's personal appointments
- ❌ Specific reasons for blocked dates

**Privacy:** This protects both the professional's and other customers' privacy.

---

#### What if the calendar shows no availability?

**Answer:**

**1. Extend Your Search Range**
- Click "Next" to view upcoming months
- Professionals may have availability further out

**2. Try Different Days**
- Weekdays often have more availability than weekends
- Early morning or late afternoon slots fill up faster

**3. Check Other Professionals**
- Browse similar professionals in your area
- Use filters to find alternatives

**4. Contact the Professional**
- Send a message explaining your needs
- They may be able to accommodate special requests

**5. Set Availability Alert** (Future Feature)
- Get notified when the professional opens new slots
- Set your preferred dates/times for notifications

---

### For Professionals

#### How do I set my working hours?

**Answer:**

**1. Go to Your Dashboard**
- Navigate to Settings → Availability

**2. Set Weekly Hours**
- Toggle each day on/off
- Set start and end times for working days
- Use presets: Weekdays, Weekends, or Every Day

**3. Quick Actions**
- **Copy to All:** Apply one day's hours to all days
- **Weekdays:** Set Monday-Friday automatically
- **Weekends:** Set Saturday-Sunday automatically

**4. Save Changes**
- Click "Save Changes" to update your availability
- Customers will see updated times immediately

**Example:**
```
Monday:    09:00 AM - 05:00 PM
Tuesday:   09:00 AM - 05:00 PM
Wednesday: 09:00 AM - 05:00 PM
Thursday:  09:00 AM - 05:00 PM
Friday:    09:00 AM - 05:00 PM
Saturday:  10:00 AM - 02:00 PM
Sunday:    Not working
```

---

#### How do I block dates for vacation?

**Answer:**

**1. Go to Availability Settings**
- Navigate to Settings → Availability → Blocked Dates tab

**2. Select Dates to Block**
- Click individual dates on the calendar (they turn red)
- Click again to unblock

**3. Quick Actions**
- **Block Entire Month:** Use for extended vacations
- **Clear All:** Remove all blocked dates

**4. Save Changes**
- Your blocked dates are saved automatically
- Customers cannot book these dates

**Best Practices:**
- ✅ Block holidays in advance (Christmas, New Year's, etc.)
- ✅ Block vacation dates as soon as you know them
- ✅ Add buffer days before/after travel
- ✅ Update weekly to keep calendar accurate

---

#### What is buffer time and why should I use it?

**Answer:**

**Buffer time** is a gap between bookings to allow for:
- Travel time between locations
- Preparation and setup
- Unexpected delays
- Rest breaks

**Default:** 30 minutes between bookings

**Example Without Buffer:**
```
10:00 AM - 12:00 PM  Booking 1 (Ends at Parque 93)
12:00 PM - 02:00 PM  Booking 2 (Starts in Usaquén)
```
❌ Problem: No time to travel from Parque 93 to Usaquén (30-45 minute drive)

**Example With 30-Minute Buffer:**
```
10:00 AM - 12:00 PM  Booking 1 (Ends at Parque 93)
12:00 PM - 12:30 PM  [BUFFER - Travel time]
12:30 PM - 02:30 PM  Booking 2 (Starts in Usaquén)
```
✅ Solution: 30 minutes to travel, park, and prepare

**Recommended Buffer Times:**
- **30 minutes:** If you work in a small area
- **45 minutes:** If you cover multiple neighborhoods
- **60 minutes:** If you work across different cities

**Configure in:** Settings → Availability → Advanced Settings

---

#### How does instant booking work?

**Answer:**

**Instant booking** allows customers to book you automatically without your approval.

**How to Enable:**
1. Go to Settings → Availability → Instant Booking
2. Toggle "Enable Instant Booking"
3. Configure your rules:
   - **Minimum notice:** How far in advance (e.g., 24 hours)
   - **Maximum duration:** Longest instant booking allowed (e.g., 8 hours)
   - **Auto-accept recurring:** Automatically confirm weekly bookings
   - **Verified customers only:** Require identity verification

**Benefits:**
- ✅ **More bookings:** Customers book faster
- ✅ **Higher conversion:** No waiting = more confirmations
- ✅ **Less admin:** Automatic confirmations save time
- ✅ **Better SEO:** Instant booking badge improves visibility

**When to Use:**
- ✅ You have consistent availability
- ✅ You want to fill your calendar faster
- ✅ You're comfortable with standard cleaning requests

**When NOT to Use:**
- ❌ You need to discuss scope before confirming
- ❌ Your availability changes frequently
- ❌ You prefer to review every booking first

**You can still cancel** instant bookings within your cancellation policy window.

---

#### Can I have different hours for different days?

**Answer:**

**Yes!** You can set unique working hours for each day of the week.

**Example: Part-Time Schedule**
```
Monday:    09:00 AM - 12:00 PM  (Morning only)
Tuesday:   Not working
Wednesday: 09:00 AM - 05:00 PM  (Full day)
Thursday:  02:00 PM - 06:00 PM  (Afternoon only)
Friday:    09:00 AM - 05:00 PM  (Full day)
Saturday:  10:00 AM - 02:00 PM  (Half day)
Sunday:    Not working
```

**Split Shifts** (Future Feature):
```
Monday: 09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM
        (Lunch break 12-2pm)
```

**How to Set:**
1. Go to Settings → Availability → Working Hours
2. Toggle each day on/off individually
3. Set different start/end times for each enabled day
4. Save changes

**Best For:**
- Part-time professionals
- Those with other commitments
- Flexible schedules
- Different weekend hours

---

#### How do customers see my availability?

**Answer:**

Customers see your availability on your **profile page** as a color-coded calendar.

**What They See:**

**1. Calendar View**
- **🟢 Green dates:** Many time slots available
- **🟡 Yellow dates:** Few slots remaining (≤2 slots or ≥70% booked)
- **🔴 Red dates:** Fully booked
- **⚫ Gray dates:** You're not working (blocked dates)

**2. Time Slot Picker** (when they click a date)
- Available start times (e.g., "9:00 AM", "9:30 AM", "10:00 AM")
- How many slots are booked (e.g., "2 of 3 slots booked today")

**3. Instant Booking Badge**
- ⚡ "Instant Booking Available" if you have it enabled

**What They DON'T See:**
- ❌ Your complete schedule
- ❌ Other customers' booking details
- ❌ Reasons for blocked dates
- ❌ Your personal information

**Privacy Protected:** Only available time slots are shown, not your full calendar.

---

#### What happens if I get double-booked?

**Answer:**

**Double-booking should NOT happen** due to our availability system. However, if it does:

**Immediate Actions:**
1. **Check Your Dashboard**
   - Go to Bookings → Upcoming
   - Verify both bookings' times

2. **Contact Support Immediately**
   - Use Help → Contact Support
   - Provide both booking IDs
   - We'll investigate and resolve

**System Protection:**
- ✅ Real-time availability checking
- ✅ Buffer time prevents overlaps
- ✅ Instant booking validates availability
- ✅ Database constraints block conflicts

**If It Happens:**
- You're **not liable** for system errors
- We'll work with customers to reschedule
- Your ratings won't be affected
- We'll compensate if you need to turn down a booking

**Prevention:**
- ✅ Always update blocked dates promptly
- ✅ Use sufficient buffer time
- ✅ Don't manually accept bookings outside the platform
- ✅ Report any booking conflicts immediately

---

#### Can I change my availability after customers book?

**Answer:**

**Yes**, but it depends on timing and impact:

**1. Changing Future Availability**
✅ **Allowed:** Block new dates or change working hours
✅ **Impact:** Only affects NEW bookings, not existing ones

**Example:**
- You have a booking for January 15 at 10 AM
- You can block January 16-20 for vacation
- The January 15 booking is still confirmed

**2. Blocking Already-Booked Dates**
⚠️ **NOT Recommended:** You can't block dates with confirmed bookings

**If You Need To:**
1. Cancel the existing booking first (see cancellation policy)
2. Then block the date
3. Customer receives cancellation notification and refund

**3. Changing Working Hours**
✅ **Allowed:** Change future hours anytime
⚠️ **Existing bookings:** Won't be affected

**Example:**
- Your hours: Mon-Fri 9 AM - 5 PM
- Customer booked: Next Monday 10 AM
- You change hours to: Mon-Fri 12 PM - 6 PM
- Result: Next Monday 10 AM booking is STILL valid

**Best Practices:**
- ✅ Update availability at least 1 week in advance
- ✅ Honor existing bookings or cancel with proper notice
- ✅ Use blocked dates for planned time off
- ✅ Communicate changes to affected customers

**Emergency Changes:**
Contact Support if you have a genuine emergency and need to cancel confirmed bookings.

---

## Troubleshooting Guide

### Issue: Calendar Shows No Availability

**Symptoms:**
- All dates show as "Blocked" or "Booked"
- No time slots appear when clicking dates
- Customers report they can't book

**Possible Causes & Solutions:**

**1. No Working Hours Set**
```typescript
// Check if availability_settings is empty
SELECT availability_settings FROM professional_profiles WHERE id = 'your-id';

// Result: {} or null
```
**Solution:** Go to Settings → Availability → Set Working Hours

**2. All Dates Blocked**
```typescript
// Check blocked_dates
SELECT blocked_dates FROM professional_profiles WHERE id = 'your-id';

// Result: ["2025-01-01", "2025-01-02", ...] (hundreds of dates)
```
**Solution:** Settings → Availability → Blocked Dates → Clear All

**3. Maximum Bookings Reached Every Day**
```typescript
// Check max_bookings_per_day setting
SELECT availability_settings->'max_bookings_per_day' FROM professional_profiles WHERE id = 'your-id';

// Result: 0 or 1
```
**Solution:** Increase max_bookings_per_day in Settings → Advanced

**4. Buffer Time Too Long**
```typescript
// Check buffer_time_minutes
SELECT availability_settings->'buffer_time_minutes' FROM professional_profiles WHERE id = 'your-id';

// Result: 180 (3 hours)
```
**Solution:** Reduce buffer time to 30-60 minutes

---

### Issue: Time Slots Not Showing

**Symptoms:**
- Calendar dates show as "Available" (green)
- But clicking a date shows "No available time slots"

**Possible Causes:**

**1. Working Hours Don't Allow Bookings**
```typescript
// Example: 9 AM - 10 AM (only 1 hour)
// Customer wants 2-hour booking
// Result: No slots fit
```
**Solution:** Extend working hours or offer shorter durations

**2. Existing Booking + Buffer Blocks All Slots**
```typescript
// Working hours: 9 AM - 5 PM
// Existing booking: 12 PM - 2 PM
// Buffer time: 2 hours
// Blocked window: 10 AM - 4 PM
// Available: 9-10 AM only (not enough for 2+ hour bookings)
```
**Solution:** Reduce buffer time or extend working hours

**3. All Slots Already Booked**
```typescript
// Max bookings per day: 3
// Existing bookings: 3
// Result: No more slots available
```
**Solution:** Increase max_bookings_per_day

---

### Issue: Customers See Different Availability Than Expected

**Symptoms:**
- You see time slots available
- Customers report they can't book those times

**Possible Causes:**

**1. Cache/Timing Issue**
- Customer's page loaded before you updated availability
- **Solution:** Ask customer to refresh page (Ctrl+F5)

**2. Booking Created Between Page Load and Checkout**
- Another customer booked the slot
- **Solution:** This is normal - first come, first served

**3. Instant Booking Rules Block Slot**
```typescript
// Slot: Tomorrow at 10 AM (23 hours away)
// min_notice_hours: 24
// Result: Customers can't instant book (< 24 hours notice)
```
**Solution:** Reduce min_notice_hours or manually approve bookings

**4. Browser Timezone Mismatch**
- Customer in different timezone sees different times
- **Solution:** (Future) Display professional's timezone explicitly

---

### Issue: Double-Booking Occurred

**Symptoms:**
- Two confirmed bookings for the same time
- Dashboard shows overlapping bookings

**Immediate Actions:**

**1. Verify Both Bookings**
```sql
SELECT id, scheduled_start, scheduled_end, status
FROM bookings
WHERE professional_id = 'your-id'
  AND status IN ('confirmed', 'in_progress')
ORDER BY scheduled_start;
```

**2. Check for Overlap**
```typescript
// Booking A: 10:00 - 12:00
// Booking B: 11:00 - 13:00
// Overlap: 11:00 - 12:00 ❌
```

**3. Contact Support Immediately**
- Provide both booking IDs
- Screenshot of dashboard
- We'll investigate and resolve

**Prevention:**
- ✅ Always use the platform for bookings (don't accept external bookings)
- ✅ Keep availability updated
- ✅ Report any system errors immediately

---

### Issue: Instant Booking Not Working

**Symptoms:**
- Instant booking is enabled
- Customers still see "Request to Book" instead of "Book Now"

**Troubleshooting:**

**1. Check Instant Booking Status**
```sql
SELECT instant_booking_enabled, instant_booking_settings
FROM professional_profiles
WHERE id = 'your-id';
```
**Expected:** `instant_booking_enabled = true`

**2. Check Minimum Notice Requirement**
```typescript
// Customer trying to book: Tomorrow at 2 PM (20 hours away)
// min_notice_hours: 24
// Result: Not eligible for instant booking
```
**Solution:** Reduce min_notice_hours in Settings

**3. Check Maximum Duration**
```typescript
// Customer wants: 10-hour deep cleaning
// max_booking_duration_hours: 8
// Result: Not eligible for instant booking
```
**Solution:** Increase max duration or manually approve long bookings

**4. Check Verified Customers Requirement**
```typescript
// only_verified_customers: true
// Customer: Not verified
// Result: Must request approval
```
**Solution:** Disable "Verified customers only" in Settings

---

### Issue: Buffer Time Not Working

**Symptoms:**
- Back-to-back bookings are accepted
- No gap between bookings

**Troubleshooting:**

**1. Check Buffer Time Setting**
```sql
SELECT availability_settings->'buffer_time_minutes'
FROM professional_profiles
WHERE id = 'your-id';
```
**Expected:** Number (e.g., 30, 45, 60)
**If null:** Buffer is disabled

**2. Verify Buffer is Applied**
```typescript
// Test: Book 10 AM - 12 PM
// Buffer: 30 minutes
// Expected unavailable: 9:30 AM - 12:30 PM
// Next available: 12:30 PM
```

**3. Check for Manual Bookings**
- If you manually confirmed a booking outside the system
- Buffer time won't apply
- **Solution:** Always use platform for bookings

---

## Future Enhancements

### 1. Recurring Availability Exceptions

**Feature:** Repeat availability patterns (e.g., "Every Monday 2-4 PM is blocked")

**Use Case:**
- Professional teaches a class every Tuesday afternoon
- Wants to block 2-4 PM every Tuesday without blocking individual dates

**Implementation:**
```typescript
interface RecurringException {
  type: 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;  // 0 = Sunday, 1 = Monday, ...
  day_of_month?: number; // 1-31
  start_time: string;
  end_time: string;
  start_date: string;
  end_date?: string;  // Optional end
}

// Example:
{
  type: 'weekly',
  day_of_week: 2,  // Tuesday
  start_time: '14:00',
  end_time: '16:00',
  start_date: '2025-01-01',
  end_date: '2025-12-31'
}
```

**Priority:** Medium
**Estimated Effort:** 2 weeks

---

### 2. Availability Templates

**Feature:** Save and load availability presets

**Use Case:**
- Professional has different schedules for summer vs winter
- Can save "Summer Hours" and "Winter Hours" templates
- Switch between templates with one click

**Implementation:**
```typescript
interface AvailabilityTemplate {
  id: string;
  professional_id: string;
  name: string;  // "Summer Hours", "Holiday Schedule"
  availability_settings: AvailabilitySettings;
  blocked_dates: string[];
  created_at: Date;
}

// API
PUT /api/professional/availability/templates
GET /api/professional/availability/templates
POST /api/professional/availability/templates/apply
```

**Priority:** Low
**Estimated Effort:** 1 week

---

### 3. Team/Multi-Professional Availability

**Feature:** Aggregate availability for cleaning companies with multiple professionals

**Use Case:**
- Company has 5 professionals
- Customer doesn't care which professional comes
- System shows combined availability

**Implementation:**
```typescript
// GET /api/companies/[id]/availability
{
  company_id: 'company-id',
  professionals: [
    { id: 'pro-1', name: 'Maria', availability: [...] },
    { id: 'pro-2', name: 'Carlos', availability: [...] },
  ],
  combined_availability: [
    { date: '2025-01-15', status: 'available', professionals: ['pro-1', 'pro-2'] },
    { date: '2025-01-16', status: 'limited', professionals: ['pro-2'] },
  ]
}
```

**Priority:** Medium
**Estimated Effort:** 3 weeks

---

### 4. Availability Synchronization

**Feature:** Sync with Google Calendar, Outlook, Apple Calendar

**Use Case:**
- Professional uses Google Calendar for personal appointments
- Wants blocked dates to sync automatically
- Bookings appear in Google Calendar

**Implementation:**
```typescript
// OAuth integration
POST /api/professional/calendar/connect  // Authorize Google Calendar
GET /api/professional/calendar/sync      // Trigger manual sync
DELETE /api/professional/calendar/disconnect

// Webhook
POST /api/webhooks/google-calendar  // Receive Google Calendar updates
```

**Priority:** High
**Estimated Effort:** 4 weeks

---

### 5. Predictive Availability Suggestions

**Feature:** AI-powered availability recommendations

**Use Case:**
- System analyzes booking patterns
- Suggests optimal working hours
- Recommends when to enable/disable instant booking

**Implementation:**
```typescript
// Analysis
- Most bookings: Tue-Thu 10 AM - 2 PM
- Low demand: Mon/Fri afternoons
- Cancellation rate: 5% (good)

// Recommendations
{
  suggestions: [
    {
      type: 'working_hours',
      message: 'Consider extending Thursday hours (high demand)',
      confidence: 0.85
    },
    {
      type: 'instant_booking',
      message: 'Enable instant booking on weekdays (low cancellations)',
      confidence: 0.72
    }
  ]
}
```

**Priority:** Low
**Estimated Effort:** 3 weeks

---

### 6. Real-Time Availability Updates

**Feature:** WebSocket/SSE for live calendar updates

**Use Case:**
- Customer viewing calendar
- Another customer books a slot
- First customer sees slot disappear in real-time (no refresh)

**Implementation:**
```typescript
// Supabase Realtime
const channel = supabase
  .channel('availability-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings',
    filter: `professional_id=eq.${professionalId}`,
  }, (payload) => {
    // Refresh calendar
    refetchAvailability();
  })
  .subscribe();
```

**Priority:** Medium
**Estimated Effort:** 1 week

---

### 7. Split Shifts Support

**Feature:** Multiple working periods per day

**Current:** One period per day (e.g., 9 AM - 5 PM)
**Enhancement:** Multiple periods (e.g., 9 AM - 12 PM, 2 PM - 5 PM)

**Implementation:**
```typescript
// Already supported in data structure!
monday: [
  { start: "09:00", end: "12:00" },  // Morning
  { start: "14:00", end: "17:00" }   // Afternoon
]
```

**Required:** UI updates in WeeklyHoursEditor

**Priority:** Medium
**Estimated Effort:** 1 week

---

### 8. Availability Alerts for Customers

**Feature:** Notify customers when availability opens

**Use Case:**
- Customer wants to book professional, but no availability
- Sets alert for preferred dates/times
- Gets email/SMS when slots open

**Implementation:**
```typescript
interface AvailabilityAlert {
  id: string;
  customer_id: string;
  professional_id: string;
  preferred_dates: string[];  // ["2025-01-15", "2025-01-16"]
  preferred_times: string[];  // ["morning", "afternoon", "evening"]
  notified: boolean;
  created_at: Date;
}

// Cron job: Check for new availability daily
// Send notifications when matches found
```

**Priority:** Low
**Estimated Effort:** 2 weeks

---

## References

**Next.js Documentation:**
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

**Supabase Documentation:**
- [PostgreSQL JSONB](https://supabase.com/docs/guides/database/json)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

**React Query:**
- [Queries](https://tanstack.com/query/latest/docs/react/guides/queries)
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

**Date Handling:**
- [date-fns](https://date-fns.org/)
- [date-fns-tz (timezones)](https://date-fns.org/docs/Time-Zones)

**Calendar Algorithms:**
- [Haversine Formula (GPS)](https://en.wikipedia.org/wiki/Haversine_formula)
- [Time Slot Scheduling](https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap)

---

**End of Availability Management Documentation**
**Last Updated:** 2025-01-06
**Version:** 1.0.0
