import { supabase } from "@/lib/supabase";

export type CancelBookingParams = {
  bookingId: string;
  reason?: string;
};

export type RescheduleBookingParams = {
  bookingId: string;
  newDate: string;
  newTime: string;
};

export type ExtendBookingParams = {
  bookingId: string;
  additionalHours: number;
};

export type AcceptBookingParams = {
  bookingId: string;
};

export type DeclineBookingParams = {
  bookingId: string;
  reason?: string;
};

export type CheckInParams = {
  bookingId: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
};

export type CheckOutParams = {
  bookingId: string;
  notes?: string;
};

/**
 * Cancel a booking
 */
export async function cancelBooking({ bookingId, reason }: CancelBookingParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to cancel booking");
  }
}

/**
 * Reschedule a booking to a new date and time
 */
export async function rescheduleBooking({
  bookingId,
  newDate,
  newTime,
}: RescheduleBookingParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/reschedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId, newScheduledStart: `${newDate}T${newTime}` }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reschedule booking");
  }
}

/**
 * Extend booking duration
 */
export async function extendBooking({
  bookingId,
  additionalHours,
}: ExtendBookingParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/extend-time`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId, additionalMinutes: additionalHours * 60 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to extend booking");
  }
}

/**
 * Accept a booking (professional action)
 */
export async function acceptBooking({ bookingId }: AcceptBookingParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to accept booking");
  }
}

/**
 * Decline a booking (professional action)
 */
export async function declineBooking({ bookingId, reason }: DeclineBookingParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to decline booking");
  }
}

/**
 * Check in to a booking (professional action)
 */
export async function checkInToBooking({
  bookingId,
  latitude,
  longitude,
  photo,
}: CheckInParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      bookingId,
      latitude,
      longitude,
      photo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to check in");
  }
}

/**
 * Check out from a booking (professional action)
 */
export async function checkOutFromBooking({ bookingId, notes }: CheckOutParams): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/check-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bookingId, notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to check out");
  }
}

/**
 * Book again from a previous booking
 */
export async function rebookFromPrevious(bookingId: string): Promise<{ newBookingId: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bookings/rebook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ originalBookingId: bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to rebook");
  }

  return response.json();
}
