import type { CalendarDay } from "@/hooks/use-calendar-grid";
import type { Currency } from "@/lib/format";

/**
 * Booking status for calendar display
 */
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

/**
 * Date availability status for calendar cells
 */
export type DateAvailabilityStatus = "available" | "blocked" | "booked" | "partial"; // Has some bookings but not fully booked

/**
 * Calendar cell data combining day info with availability and pricing
 */
export interface CalendarCellData extends CalendarDay {
  status: DateAvailabilityStatus;
  hourlyRateCents: number | null;
  bookingCount: number;
  bookings: CalendarBooking[];
}

/**
 * Simplified booking data for calendar display
 */
export type CalendarBooking = {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: BookingStatus;
  customerName: string;
  serviceName: string;
  amountCents: number;
  currency: Currency;
};

/**
 * Date range selection state
 */
type DateRangeSelection = {
  start: Date | null;
  end: Date | null;
  hoveredDate: Date | null;
};

/**
 * Props for the main calendar component
 */
export type AirbnbBookingCalendarProps = {
  professionalId: string;
  defaultHourlyRateCents: number;
  currency: Currency;
  onBookingClick?: (bookingId: string) => void;
  className?: string;
};

/**
 * Props for calendar header
 */
export type CalendarHeaderProps = {
  monthLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  className?: string;
};

/**
 * Props for calendar grid
 */
export type CalendarGridProps = {
  days: CalendarCellData[];
  selectedDates: string[];
  hoveredDate: Date | null;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
  onBookingClick?: (bookingId: string) => void;
  currency: Currency;
  className?: string;
};

/**
 * Visual state for a calendar day cell
 */
type CalendarDayCellState =
  | "available"
  | "blocked"
  | "booked"
  | "selected"
  | "in-range"
  | "today"
  | "past"
  | "outside-month";

/**
 * Props for individual day cell
 */
export type CalendarDayCellProps = {
  day: CalendarCellData;
  isSelected: boolean;
  isInRange: boolean;
  isSelectionStart: boolean;
  isSelectionEnd: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
  currency: Currency;
  className?: string;
};

/**
 * Props for selection action panel
 */
export type SelectionActionPanelProps = {
  selectedDates: string[];
  hourlyRateCents: number;
  currency: Currency;
  onBlock: () => void;
  onOpen: () => void;
  onEditRate: () => void;
  onClear: () => void;
  isVisible: boolean;
  isLoading?: boolean;
  className?: string;
};

/**
 * Props for price editor modal
 */
export type PriceEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: string[];
  currentRateCents: number;
  currency: Currency;
  onSave: (newRateCents: number) => Promise<void>;
};

/**
 * Pricing data by date (from useCalendarPricing hook)
 */
export type PricingByDate = {
  [dateKey: string]: number; // dateKey (YYYY-MM-DD) -> hourly rate in cents
};

/**
 * Blocked dates set (from availability data)
 */
export type BlockedDatesSet = Set<string>; // Set of dateKeys (YYYY-MM-DD)

/**
 * API request for updating pricing
 */
type UpdatePricingRequest = {
  dates: string[];
  hourlyRateCents: number;
};

/**
 * API request for blocking/unblocking dates
 */
type UpdateBlockedDatesRequest = {
  dates: string[];
  action: "block" | "unblock";
};

/**
 * API response for pricing update
 */
type UpdatePricingResponse = {
  success: boolean;
  updatedDates: number;
};

/**
 * API response for blocked dates update
 */
type UpdateBlockedDatesResponse = {
  success: boolean;
  blockedDates: string[];
};

/**
 * Return type for useDateRangeSelection hook
 */
export type UseDateRangeSelectionReturn = {
  selectionStart: Date | null;
  selectionEnd: Date | null;
  selectedDates: string[]; // Array of YYYY-MM-DD keys
  hoveredDate: Date | null;
  handleDateClick: (date: Date) => void;
  handleDateHover: (date: Date | null) => void;
  clearSelection: () => void;
  isDateSelected: (date: Date) => boolean;
  isDateInRange: (date: Date) => boolean;
  isSelectionStart: (date: Date) => boolean;
  isSelectionEnd: (date: Date) => boolean;
};

/**
 * Return type for useCalendarPricing hook
 */
export type UseCalendarPricingReturn = {
  pricingByDate: PricingByDate;
  defaultRateCents: number;
  updatePricing: (dates: string[], rateCents: number) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
};

/**
 * Return type for useCalendarAvailability hook
 */
export type UseCalendarAvailabilityReturn = {
  blockedDates: BlockedDatesSet;
  bookingsByDate: Map<string, CalendarBooking[]>;
  updateBlockedDates: (dates: string[], action: "block" | "unblock") => Promise<void>;
  isUpdating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
