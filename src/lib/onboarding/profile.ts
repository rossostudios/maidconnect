// Helper functions for onboarding profile data transformation

type SupabaseProfessionalProfile = {
  bio: string | null;
  languages: string[] | null;
  services: Array<{
    name?: string | null;
    hourly_rate_cop?: number | null;
    description?: string | null;
  }> | null;
  availability: {
    schedule?: Array<{
      day?: string | null;
      start?: string | null;
      end?: string | null;
      notes?: string | null;
    }> | null;
  } | null;
};

export type ProfileInitialData = {
  bio?: string | null;
  languages?: string[] | null;
  services?: Array<{
    name?: string | null;
    hourly_rate_cop?: number | null;
    description?: string | null;
  }> | null;
  availability?: Array<{
    day?: string | null;
    start?: string | null;
    end?: string | null;
    notes?: string | null;
  }> | null;
};

/**
 * Safely extract availability schedule from Supabase record
 */
function extractAvailabilitySchedule(
  availability: SupabaseProfessionalProfile["availability"]
): ProfileInitialData["availability"] {
  if (!availability || typeof availability !== "object") {
    return [];
  }

  const schedule = availability.schedule ?? [];
  return Array.isArray(schedule) ? schedule : [];
}

/**
 * Transform Supabase professional profile to form initial data
 */
export function transformProfileData(
  professionalProfileData: SupabaseProfessionalProfile | null
): ProfileInitialData | undefined {
  if (!professionalProfileData) {
    return;
  }

  return {
    bio: professionalProfileData.bio ?? "",
    languages: professionalProfileData.languages ?? [],
    services: Array.isArray(professionalProfileData.services)
      ? professionalProfileData.services
      : [],
    availability: extractAvailabilitySchedule(professionalProfileData.availability),
  };
}

/**
 * Get current onboarding step index based on status
 */
export function currentStepIndex(status: string | null): number {
  switch (status) {
    case "application_pending":
      return 0;
    case "application_in_review":
      return 1;
    case "approved":
      return 2;
    case "active":
      return 3;
    default:
      return 0;
  }
}

/**
 * Get CSS classes for onboarding step based on completion status
 */
export function getStepClassName(isCompleted: boolean, isCurrent: boolean): string {
  if (isCompleted) {
    return "border-[#FF5200]/40 bg-[#FF5200]/10";
  }

  if (isCurrent) {
    return "border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_10px_40px_rgba(22,22,22,0.04)]";
  }

  return "border-[#E5E5E5] bg-[#FFFFFF]";
}
