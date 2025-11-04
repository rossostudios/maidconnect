import type { ProfessionalProfile } from "../professionals/types";

export type Favorite = {
  id: string;
  userId: string;
  professionalId: string;
  createdAt: Date;
  professional?: ProfessionalProfile;
};

export type FavoriteRecord = {
  id: string;
  user_id: string;
  professional_id: string;
  created_at: string;
};
