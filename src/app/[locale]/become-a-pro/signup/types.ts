export type ProSignUpActionState = {
  status: "idle" | "error" | "success";
  error?: string;
  fieldErrors?: Record<string, string>;
};

const defaultProSignUpState: ProSignUpActionState = { status: "idle" };

export type ServiceCategory =
  | "housekeeping"
  | "childcare"
  | "cooking"
  | "eldercare"
  | "petcare"
  | "gardening"
  | "maintenance"
  | "other";

export type ExperienceLevel = "0-1" | "1-3" | "3-5" | "5-10" | "10+";

export type AvailabilityOption = "full-time" | "part-time" | "weekends" | "flexible";
