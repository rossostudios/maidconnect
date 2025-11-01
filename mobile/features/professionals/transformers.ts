import type {
  AvailabilitySlot,
  ProfessionalProfile,
  ProfessionalRecord,
  ProfessionalService,
} from './types';

export function parseServices(payload: unknown): ProfessionalService[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const typed = entry as Record<string, unknown>;
      const name = typeof typed.name === 'string' ? typed.name : null;
      const rateValue = typed.hourly_rate_cop;
      let rate: number | null = null;

      if (typeof rateValue === 'number') {
        rate = rateValue;
      } else if (typeof rateValue === 'string') {
        const parsed = Number.parseInt(rateValue, 10);
        rate = Number.isNaN(parsed) ? null : parsed;
      }

      const description = typeof typed.description === 'string' ? typed.description : null;

      return {
        name,
        hourlyRateCop: rate,
        description,
      };
    })
    .filter((value): value is ProfessionalService => Boolean(value));
}

export function parseAvailability(payload: unknown): AvailabilitySlot[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const schedule = record.schedule;

  if (!Array.isArray(schedule)) {
    return [];
  }

  return schedule
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const typed = entry as Record<string, unknown>;

      return {
        day: typeof typed.day === 'string' ? typed.day : null,
        start: typeof typed.start === 'string' ? typed.start : null,
        end: typeof typed.end === 'string' ? typed.end : null,
        notes: typeof typed.notes === 'string' ? typed.notes : null,
      };
    })
    .filter((value): value is AvailabilitySlot => Boolean(value?.day));
}

export function computeAvailableToday(schedule: AvailabilitySlot[]): boolean {
  if (schedule.length === 0) {
    return false;
  }

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  return schedule.some((slot) => slot.day?.toLowerCase() === today.toLowerCase());
}

export function formatLocation(city: string | null, country: string | null) {
  return [city, country].filter(Boolean).join(' · ');
}

export function mapProfessionalRecord(record: ProfessionalRecord): ProfessionalProfile | null {
  if (!record?.profile_id) {
    return null;
  }

  const services = parseServices(record.services);
  const availability = parseAvailability(record.availability);

  return {
    profileId: record.profile_id,
    fullName: record.full_name,
    bio: record.bio,
    experienceYears: record.experience_years,
    languages: record.languages ?? [],
    services,
    primaryServices: record.primary_services ?? [],
    city: record.city,
    country: record.country,
    availability,
    professionalStatus: record.professional_status,
    verificationLevel: record.verification_level,
    rating: record.rating,
    reviewCount: record.review_count ?? 0,
    onTimeRate: record.on_time_rate,
    acceptanceRate: record.acceptance_rate,
    totalCompletedBookings: record.total_completed_bookings ?? 0,
    distanceKm: record.distance_km,
  };
}
