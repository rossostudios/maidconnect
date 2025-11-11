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

export type ProfessionalReference = {
  name: string | null;
  relationship: string | null;
  contact: string | null;
};

export function parseServices(payload: unknown): ProfessionalService[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const typed = entry as Record<string, unknown>;
      const name = typeof typed.name === "string" ? typed.name : null;
      const rateValue = typed.hourly_rate_cop;
      let rate: number | null = null;
      if (typeof rateValue === "number") {
        rate = rateValue;
      } else if (typeof rateValue === "string") {
        rate = Number.parseInt(rateValue, 10);
      }
      const description = typeof typed.description === "string" ? typed.description : null;
      return {
        name,
        hourlyRateCop: rate && !Number.isNaN(rate) ? rate : null,
        description,
      };
    })
    .filter((value): value is ProfessionalService => Boolean(value));
}

export function parseAvailability(payload: unknown): AvailabilitySlot[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const record = payload as Record<string, unknown>;
  const schedule = record.schedule;
  if (!Array.isArray(schedule)) {
    return [];
  }

  return schedule
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const typed = entry as Record<string, unknown>;
      return {
        day: typeof typed.day === "string" ? typed.day : null,
        start: typeof typed.start === "string" ? typed.start : null,
        end: typeof typed.end === "string" ? typed.end : null,
        notes: typeof typed.notes === "string" ? typed.notes : null,
      };
    })
    .filter((value): value is AvailabilitySlot => Boolean(value?.day));
}

export function parseReferences(payload: unknown): ProfessionalReference[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const typed = entry as Record<string, unknown>;
      return {
        name: typeof typed.name === "string" ? typed.name : null,
        relationship: typeof typed.relationship === "string" ? typed.relationship : null,
        contact: typeof typed.contact === "string" ? typed.contact : null,
      };
    })
    .filter((value): value is ProfessionalReference => Boolean(value));
}

export function computeAvailableToday(schedule: AvailabilitySlot[]): boolean {
  if (schedule.length === 0) {
    return false;
  }
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  return schedule.some((slot) => slot.day?.toLowerCase() === today.toLowerCase());
}

export function formatLocation(city: string | null, country: string | null) {
  return [city, country].filter(Boolean).join(" · ");
}
