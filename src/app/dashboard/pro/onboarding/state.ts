export const REQUIRED_DOCUMENTS = [
  { key: "government_id", label: "Government ID" },
  { key: "proof_of_address", label: "Proof of address" },
] as const;

export const OPTIONAL_DOCUMENTS = [
  { key: "certification", label: "Professional certification (optional)" },
] as const;

export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const defaultActionState: OnboardingActionState = { status: "idle" };
