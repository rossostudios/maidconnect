export type UserProfile = {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  locale: string;
  city: string | null;
  country: string | null;
  onboardingStatus: string;
  createdAt: Date;
};

export type ProfileRecord = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  locale: string;
  city: string | null;
  country: string | null;
  onboarding_status: string;
  created_at: string;
};

export type UpdateProfileParams = {
  fullName?: string;
  phone?: string;
  city?: string;
  country?: string;
};
