export type BookingRecord = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_estimated: number | null;
  addons_total_amount: number | null;
  currency: string | null;
  professional_id: string;
  customer_id: string;
  address: Record<string, unknown> | null;
  professional?: unknown;
  customer?: unknown;
};

export type Booking = {
  id: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  durationMinutes: number | null;
  totalAmount: number | null;
  currency: string | null;
  professionalName: string | null;
  customerName: string | null;
  addressSummary: string | null;
};

export type BookingStatusSummary = {
  status: string;
  count: number;
};

export type CreateBookingParams = {
  professionalId: string;
  scheduledStart: string;
  scheduledEnd?: string;
  durationMinutes: number;
  amount?: number;
  currency: string;
  specialInstructions?: string;
  address: Record<string, unknown>;
  serviceName: string;
  serviceHourlyRate: number;
};

export type CreateBookingResponse = {
  bookingId: string;
  clientSecret: string;
  paymentIntentId: string;
};
