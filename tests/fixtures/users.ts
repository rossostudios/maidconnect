/**
 * User Test Fixtures
 *
 * Shared test data for user-related tests.
 */

export const testUsers = {
  user: {
    id: "test-user-001",
    email: "user@example.com",
    role: "user",
    first_name: "Test",
    last_name: "User",
    phone: "+57 300 123 4567",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  professional: {
    id: "test-pro-001",
    email: "pro@example.com",
    role: "professional",
    first_name: "Jane",
    last_name: "Doe",
    phone: "+57 300 765 4321",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  admin: {
    id: "test-admin-001",
    email: "admin@example.com",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    phone: "+57 300 999 8888",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
} as const;

export const testProfessionalProfiles = {
  cleaner: {
    id: "test-pro-profile-001",
    user_id: "test-pro-001",
    first_name: "Jane",
    last_name: "Doe",
    bio: "Experienced cleaning professional with 5+ years",
    hourly_rate: 50000,
    services: ["cleaning", "deep-cleaning"],
    availability: {
      monday: ["09:00", "17:00"],
      tuesday: ["09:00", "17:00"],
      wednesday: ["09:00", "17:00"],
      thursday: ["09:00", "17:00"],
      friday: ["09:00", "17:00"],
    },
    rating: 4.8,
    total_reviews: 24,
    location: {
      city: "Bogotá",
      locality: "Chapinero",
      coordinates: { lat: 4.6097, lon: -74.0817 },
    },
    verified: true,
    background_check_status: "approved",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  cook: {
    id: "test-pro-profile-002",
    user_id: "test-pro-002",
    first_name: "Carlos",
    last_name: "Martinez",
    bio: "Professional chef specializing in Colombian cuisine",
    hourly_rate: 75000,
    services: ["cooking", "meal-prep"],
    availability: {
      monday: ["10:00", "18:00"],
      wednesday: ["10:00", "18:00"],
      friday: ["10:00", "18:00"],
    },
    rating: 4.9,
    total_reviews: 42,
    location: {
      city: "Bogotá",
      locality: "Usaquén",
      coordinates: { lat: 4.7000, lon: -74.0300 },
    },
    verified: true,
    background_check_status: "approved",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
} as const;
