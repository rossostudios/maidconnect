/**
 * Availability Calculation Utilities
 *
 * Handles:
 * - Professional availability based on working hours
 * - Blocked dates (vacations, holidays)
 * - Existing bookings
 * - Buffer times between bookings
 * - Instant booking eligibility
 */

export type TimeSlot = {
  start: string; // HH:MM format
  end: string;
};

export type WorkingHours = {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
};

export type AvailabilitySettings = {
  working_hours: WorkingHours;
  buffer_time_minutes?: number;
  max_bookings_per_day?: number;
  advance_booking_days?: number;
};

export type DayAvailability = {
  date: string; // YYYY-MM-DD
  status: "available" | "limited" | "booked" | "blocked";
  availableSlots: string[]; // Array of start times in HH:MM format
  bookingCount: number;
  maxBookings: number;
};

export type InstantBookingSettings = {
  min_notice_hours: number;
  max_booking_duration_hours: number;
  auto_accept_recurring?: boolean;
  only_verified_customers?: boolean;
};

/**
 * Get day of week name from date
 */
function getDayOfWeek(date: Date): keyof WorkingHours {
  const days: (keyof WorkingHours)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  // getDay() always returns 0-6, so this is safe
  return days[date.getDay()]!;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  // split always returns at least one element
  return date.toISOString().split("T")[0]!;
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  // HH:MM format always has 2 parts
  return hours! * 60 + minutes!;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Check if a date is blocked
 */
export function isDateBlocked(date: Date, blockedDates: string[]): boolean {
  const dateStr = formatDate(date);
  return blockedDates.includes(dateStr);
}

/**
 * Get working hours for a specific date
 */
export function getWorkingHoursForDate(date: Date, settings: AvailabilitySettings): TimeSlot[] {
  // Defensive check: ensure working_hours exists
  if (!settings?.working_hours) {
    return [];
  }
  const dayOfWeek = getDayOfWeek(date);
  return settings.working_hours[dayOfWeek] || [];
}

/**
 * Generate available time slots for a date
 * Accounts for: working hours, buffer times, existing bookings
 */
export function generateTimeSlots(
  date: Date,
  settings: AvailabilitySettings,
  existingBookings: { scheduled_start: string; scheduled_end: string }[],
  blockedDates: string[],
  slotDurationMinutes = 60 // Default 1-hour slots
): string[] {
  // Check if date is blocked
  if (isDateBlocked(date, blockedDates)) {
    return [];
  }

  // Get working hours for this day
  const workingHours = getWorkingHoursForDate(date, settings);
  if (workingHours.length === 0) {
    return [];
  }

  const bufferTime = settings.buffer_time_minutes || 0;
  const slots: string[] = [];

  // For each working period
  for (const period of workingHours) {
    const periodStart = timeToMinutes(period.start);
    const periodEnd = timeToMinutes(period.end);

    // Generate slots within this period
    for (let time = periodStart; time + slotDurationMinutes <= periodEnd; time += 30) {
      const slotStart = minutesToTime(time);

      // Check if slot conflicts with existing bookings (including buffer)
      const hasConflict = existingBookings.some((booking) => {
        const bookingDate = new Date(booking.scheduled_start);
        if (formatDate(bookingDate) !== formatDate(date)) {
          return false; // Different day
        }

        const bookingStart = new Date(booking.scheduled_start);
        const bookingEnd = new Date(booking.scheduled_end);

        const bookingStartMins = bookingStart.getHours() * 60 + bookingStart.getMinutes();
        const bookingEndMins = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

        // Add buffer time
        const bufferedStart = bookingStartMins - bufferTime;
        const bufferedEnd = bookingEndMins + bufferTime;

        // Check overlap
        const slotStartMins = time;
        const slotEndMins = time + slotDurationMinutes;

        return !(slotEndMins <= bufferedStart || slotStartMins >= bufferedEnd);
      });

      if (!hasConflict) {
        slots.push(slotStart);
      }
    }
  }

  return slots;
}

/**
 * Check if instant booking is allowed for given parameters
 */
export function canInstantBook(
  scheduledStart: Date,
  durationHours: number,
  settings: InstantBookingSettings,
  isRecurring = false
): { allowed: boolean; reason?: string } {
  const now = new Date();
  const hoursUntil = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check minimum notice
  if (hoursUntil < settings.min_notice_hours) {
    return {
      allowed: false,
      reason: `Requires ${settings.min_notice_hours} hours notice`,
    };
  }

  // Check maximum duration
  if (durationHours > settings.max_booking_duration_hours) {
    return {
      allowed: false,
      reason: `Maximum duration is ${settings.max_booking_duration_hours} hours`,
    };
  }

  // Check recurring settings
  if (isRecurring && !settings.auto_accept_recurring) {
    return {
      allowed: false,
      reason: "Recurring bookings require approval",
    };
  }

  return { allowed: true };
}

/**
 * Calculate availability status for a date
 */
export function calculateDayStatus(
  date: Date,
  availableSlots: string[],
  bookingCount: number,
  maxBookings: number,
  blockedDates: string[]
): DayAvailability["status"] {
  if (isDateBlocked(date, blockedDates)) {
    return "blocked";
  }

  if (bookingCount >= maxBookings) {
    return "booked";
  }

  if (availableSlots.length === 0) {
    return "booked";
  }

  if (availableSlots.length <= 2 || bookingCount >= maxBookings * 0.7) {
    return "limited";
  }

  return "available";
}

/**
 * Get availability for a date range
 */
export function getAvailabilityForRange(
  startDate: Date,
  endDate: Date,
  settings: AvailabilitySettings,
  existingBookings: { scheduled_start: string; scheduled_end: string }[],
  blockedDates: string[]
): DayAvailability[] {
  const availability: DayAvailability[] = [];
  const maxBookings = settings.max_bookings_per_day || 5;

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = formatDate(current);

    // Count bookings on this date
    const bookingsOnDate = existingBookings.filter((booking) => {
      const bookingDate = formatDate(new Date(booking.scheduled_start));
      return bookingDate === dateStr;
    });

    // Generate available slots
    const availableSlots = generateTimeSlots(current, settings, existingBookings, blockedDates);

    // Calculate status
    const status = calculateDayStatus(
      current,
      availableSlots,
      bookingsOnDate.length,
      maxBookings,
      blockedDates
    );

    availability.push({
      date: dateStr,
      status,
      availableSlots,
      bookingCount: bookingsOnDate.length,
      maxBookings,
    });

    current.setDate(current.getDate() + 1);
  }

  return availability;
}

/**
 * Check if a specific time slot is available
 */
export function isSlotAvailable(
  date: Date,
  startTime: string,
  durationMinutes: number,
  settings: AvailabilitySettings,
  existingBookings: { scheduled_start: string; scheduled_end: string }[],
  blockedDates: string[]
): boolean {
  // Check if date is blocked
  if (isDateBlocked(date, blockedDates)) {
    return false;
  }

  // Check if it's a working day
  const workingHours = getWorkingHoursForDate(date, settings);
  if (workingHours.length === 0) {
    return false;
  }

  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;

  // Check if slot is within working hours
  const isWithinWorkingHours = workingHours.some((period) => {
    const periodStart = timeToMinutes(period.start);
    const periodEnd = timeToMinutes(period.end);
    return startMins >= periodStart && endMins <= periodEnd;
  });

  if (!isWithinWorkingHours) {
    return false;
  }

  // Check for conflicts with existing bookings
  const bufferTime = settings.buffer_time_minutes || 0;
  const dateStr = formatDate(date);

  const hasConflict = existingBookings.some((booking) => {
    const bookingDate = formatDate(new Date(booking.scheduled_start));
    if (bookingDate !== dateStr) {
      return false;
    }

    const bookingStart = new Date(booking.scheduled_start);
    const bookingEnd = new Date(booking.scheduled_end);

    const bookingStartMins = bookingStart.getHours() * 60 + bookingStart.getMinutes();
    const bookingEndMins = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

    const bufferedStart = bookingStartMins - bufferTime;
    const bufferedEnd = bookingEndMins + bufferTime;

    return !(endMins <= bufferedStart || startMins >= bufferedEnd);
  });

  return !hasConflict;
}

/**
 * Get next available date
 */
export function getNextAvailableDate(
  settings: AvailabilitySettings,
  existingBookings: { scheduled_start: string; scheduled_end: string }[],
  blockedDates: string[],
  maxDaysAhead = 30
): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= maxDaysAhead; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);

    const slots = generateTimeSlots(checkDate, settings, existingBookings, blockedDates);

    if (slots.length > 0) {
      return checkDate;
    }
  }

  return null;
}
