export type ProfessionalService = {
  name: string | null;
  hourlyRateCop: number | null;
  description: string | null;
};

export type AvailabilitySlot = {
  day: string | null;
  start: string | null;
  end: string | null;
  notes: string | null;
};

export type ProfessionalProfile = {
  profileId: string;
  fullName: string | null;
  bio: string | null;
  experienceYears: number | null;
  languages: string[];
  services: ProfessionalService[];
  primaryServices: string[];
  city: string | null;
  country: string | null;
  availability: AvailabilitySlot[];
  professionalStatus: string | null;
  verificationLevel: string | null;
  rating: number | null;
  reviewCount: number;
  onTimeRate: number | null;
  acceptanceRate: number | null;
  totalCompletedBookings: number;
  distanceKm: number | null;
};

export type ProfessionalRecord = {
  profile_id: string;
  full_name: string | null;
  bio: string | null;
  experience_years: number | null;
  languages: string[] | null;
  services: unknown;
  primary_services: string[] | null;
  city: string | null;
  country: string | null;
  availability: unknown;
  professional_status: string | null;
  verification_level: string | null;
  rating: number | null;
  review_count: number | null;
  on_time_rate: number | null;
  acceptance_rate: number | null;
  total_completed_bookings: number | null;
  distance_km: number | null;
};
