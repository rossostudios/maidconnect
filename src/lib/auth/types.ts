export type AppRole = "customer" | "professional" | "admin";

export type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "interview_scheduled"
  | "approved"
  | "active"
  | "suspended";

export type ProfileRecord = {
  id: string;
  role: AppRole;
  locale: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  onboarding_status: OnboardingStatus;
  created_at: string;
  updated_at: string;
};

export type AppUser = {
  id: string;
  email: string | null;
  role: AppRole;
  onboardingStatus: OnboardingStatus;
  locale: string;
};

export type SessionContext = {
  user: AppUser | null;
};
