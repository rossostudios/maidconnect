/**
 * Booking Test Fixtures
 *
 * Shared test data for booking-related tests.
 */

export const testBookings = {
  pending: {
    id: "test-booking-001",
    user_id: "test-user-001",
    professional_id: "test-pro-001",
    service_type: "cleaning",
    status: "pending",
    start_time: "2024-12-25T09:00:00Z",
    end_time: "2024-12-25T11:00:00Z",
    total_amount: 100000,
    hourly_rate: 50000,
    hours: 2,
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
      instructions: "Apartment 301, building entrance code: 1234",
    },
    special_requirements: "Please bring eco-friendly cleaning products",
    created_at: "2024-12-20T00:00:00Z",
    updated_at: "2024-12-20T00:00:00Z",
  },
  confirmed: {
    id: "test-booking-002",
    user_id: "test-user-001",
    professional_id: "test-pro-002",
    service_type: "cooking",
    status: "confirmed",
    start_time: "2024-12-26T12:00:00Z",
    end_time: "2024-12-26T15:00:00Z",
    total_amount: 225000,
    hourly_rate: 75000,
    hours: 3,
    location: {
      address: "Carrera 7 #71-21",
      city: "Bogotá",
      locality: "Chapinero",
      instructions: "House with green gate",
    },
    special_requirements: "Prepare lunch for 4 people, vegetarian options please",
    created_at: "2024-12-21T00:00:00Z",
    updated_at: "2024-12-21T10:00:00Z",
  },
  completed: {
    id: "test-booking-003",
    user_id: "test-user-001",
    professional_id: "test-pro-001",
    service_type: "deep-cleaning",
    status: "completed",
    start_time: "2024-12-15T09:00:00Z",
    end_time: "2024-12-15T13:00:00Z",
    total_amount: 200000,
    hourly_rate: 50000,
    hours: 4,
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
      instructions: "Apartment 301",
    },
    completed_at: "2024-12-15T13:00:00Z",
    created_at: "2024-12-10T00:00:00Z",
    updated_at: "2024-12-15T13:00:00Z",
  },
  cancelled: {
    id: "test-booking-004",
    user_id: "test-user-001",
    professional_id: "test-pro-001",
    service_type: "cleaning",
    status: "cancelled",
    start_time: "2024-12-18T09:00:00Z",
    end_time: "2024-12-18T11:00:00Z",
    total_amount: 100000,
    hourly_rate: 50000,
    hours: 2,
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
    },
    cancellation_reason: "User requested cancellation",
    cancelled_by: "user",
    cancelled_at: "2024-12-17T10:00:00Z",
    created_at: "2024-12-16T00:00:00Z",
    updated_at: "2024-12-17T10:00:00Z",
  },
} as const;

export const testBookingRequests = {
  valid: {
    service_type: "cleaning",
    start_time: "2024-12-25T09:00:00Z",
    hours: 2,
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
    },
  },
  invalidTime: {
    service_type: "cleaning",
    start_time: "2024-12-25T22:00:00Z", // Too late
    hours: 2,
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
    },
  },
  invalidDuration: {
    service_type: "cleaning",
    start_time: "2024-12-25T09:00:00Z",
    hours: 12, // Too long
    location: {
      address: "Calle 85 #15-25",
      city: "Bogotá",
      locality: "Chapinero",
    },
  },
} as const;
