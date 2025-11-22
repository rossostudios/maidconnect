/**
 * Professional types for mobile app
 * Based on web app professional_profiles table
 */

export interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  bio?: string;
  hourly_rate_cents: number;
  years_of_experience: number;
  services: string[];
  city: string;
  country_code: string;
  rating?: number;
  review_count?: number;
  verified: boolean;
  background_check_status?: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ProfessionalSearchParams {
  service?: string;
  city?: string;
  country_code?: string;
  min_rating?: number;
  max_hourly_rate_cents?: number;
  verified_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProfessionalListResponse {
  professionals: Professional[];
  total_count: number;
  has_more: boolean;
}
