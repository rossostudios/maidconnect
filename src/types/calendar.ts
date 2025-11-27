/**
 * Calendar Health & Availability Types
 * Sprint 1 - Professional Experience Enhancement
 */

/**
 * Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkingHours = {
  id: string;
  profileId: string;
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  createdAt: string;
  updatedAt: string;
};

export type TravelBuffer = {
  id: string;
  profileId: string;
  serviceRadiusKm: number;
  serviceLocation: {
    lat: number;
    lng: number;
  };
  travelBufferBeforeMinutes: number;
  travelBufferAfterMinutes: number;
  avgTravelSpeedKmh: number;
  createdAt: string;
  updatedAt: string;
};

export type WeeklySchedule = {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}[];

type AvailabilityCache = {
  profileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  canAcceptBookings: boolean;
  onboardingCompletionPercentage: number;
  serviceLocation: {
    lat: number;
    lng: number;
  } | null;
  serviceRadiusKm: number | null;
  travelBufferBeforeMinutes: number | null;
  travelBufferAfterMinutes: number | null;
  weeklySchedule: WeeklySchedule;
  availableDaysCount: number;
  lastProfileUpdate: string;
};

/**
 * Calendar Health Metrics
 */
export type CalendarHealth = {
  hasWorkingHours: boolean;
  hasServiceRadius: boolean;
  hasTravelBuffers: boolean;
  availableDaysCount: number;
  healthScore: number; // 0-100
  recommendations: string[];
};

/**
 * Time Slot for Availability Display
 */
type TimeSlot = {
  start: string; // ISO 8601
  end: string; // ISO 8601
  available: boolean;
  conflictReason?: "booking" | "travel-buffer" | "outside-hours";
};

/**
 * Server Action Response Types
 */
type UpdateWorkingHoursResponse = {
  success: boolean;
  workingHours?: WorkingHours;
  error?: string;
};

type UpdateTravelBufferResponse = {
  success: boolean;
  travelBuffer?: TravelBuffer;
  error?: string;
};

type GetCalendarHealthResponse = {
  success: boolean;
  health?: CalendarHealth;
  error?: string;
};

type CheckAvailabilityResponse = {
  success: boolean;
  available?: boolean;
  conflicts?: string[];
  error?: string;
};
