import { supabase } from '@/lib/supabase';

import type { Booking, BookingRecord, BookingStatusSummary } from './types';

const STATUS_DISPLAY_ORDER = [
  'pending_payment',
  'authorized',
  'confirmed',
  'in_progress',
  'completed',
  'declined',
  'canceled',
];

export async function fetchBookings(limit = 25): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
        id,
        status,
        scheduled_start,
        scheduled_end,
        duration_minutes,
        amount_estimated,
        addons_total_amount,
        currency,
        professional_id,
        customer_id,
        address,
        professional:professional_profiles!bookings_professional_id_fkey (
          profile_id,
          full_name
        ),
        customer:profiles!bookings_customer_id_fkey (
          id,
          full_name
        )
      `,
    )
    .order('scheduled_start', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const records = Array.isArray(data) ? (data as unknown as BookingRecord[]) : [];

  return records.map(mapBookingRecord);
}

export function summarizeStatuses(bookings: Booking[]): BookingStatusSummary[] {
  const counts = new Map<string, number>();

  bookings.forEach((booking) => {
    const current = counts.get(booking.status) ?? 0;
    counts.set(booking.status, current + 1);
  });

  const sortedStatuses = [...counts.entries()].sort((a, b) => {
    const aIndex = STATUS_DISPLAY_ORDER.indexOf(a[0]);
    const bIndex = STATUS_DISPLAY_ORDER.indexOf(b[0]);

    if (aIndex === -1 && bIndex === -1) {
      return a[0].localeCompare(b[0]);
    }

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  return sortedStatuses.map(([status, count]) => ({ status, count }));
}

function mapBookingRecord(record: BookingRecord): Booking {
  return {
    id: record.id,
    status: record.status,
    startsAt: record.scheduled_start ? new Date(record.scheduled_start) : null,
    endsAt: record.scheduled_end ? new Date(record.scheduled_end) : null,
    durationMinutes: record.duration_minutes,
    totalAmount: computeTotalAmount(record),
    currency: record.currency ?? 'cop',
    professionalName: extractProfessionalName(record.professional),
    customerName: extractCustomerName(record.customer),
    addressSummary: summarizeAddress(record.address),
  };
}

function summarizeAddress(address: Record<string, unknown> | null): string | null {
  if (!address) {
    return null;
  }

  const label = typeof address.label === 'string' ? address.label : null;
  const neighborhood = typeof address.neighborhood === 'string' ? address.neighborhood : null;
  const city = typeof address.city === 'string' ? address.city : null;

  return [label, neighborhood, city].filter(Boolean).join(' · ') || null;
}

function computeTotalAmount(record: BookingRecord): number | null {
  const estimated = record.amount_estimated ?? 0;
  const addons = record.addons_total_amount ?? 0;
  const total = estimated + addons;

  return total > 0 ? total : null;
}

function extractProfessionalName(source: BookingRecord['professional']): string | null {
  if (!source) {
    return null;
  }

  if (Array.isArray(source)) {
    return extractProfessionalName(source[0] as BookingRecord['professional']);
  }

  if (typeof source !== 'object') {
    return null;
  }

  const record = source as Record<string, unknown>;
  const name = record.full_name;

  return typeof name === 'string' ? name : null;
}

function extractCustomerName(source: BookingRecord['customer']): string | null {
  if (!source) {
    return null;
  }

  if (Array.isArray(source)) {
    return extractCustomerName(source[0] as BookingRecord['customer']);
  }

  if (typeof source !== 'object') {
    return null;
  }

  const record = source as Record<string, unknown>;
  const name = record.full_name;

  return typeof name === 'string' ? name : null;
}
