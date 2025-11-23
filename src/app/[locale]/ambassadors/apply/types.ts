export type AmbassadorApplicationState = {
  status: "idle" | "error" | "success";
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const defaultApplicationState: AmbassadorApplicationState = { status: "idle" };

export type ProfessionType =
  | "realtor"
  | "lawyer"
  | "accountant"
  | "interior_designer"
  | "property_manager"
  | "blogger"
  | "community_leader"
  | "other";

export type ReferralReach = "1-5" | "6-15" | "16-30" | "31+";
