export const REQUIRED_DOCUMENTS = [
  { key: "government_id", label: "Government ID" },
  { key: "proof_of_address", label: "Proof of address" },
] as const;

export const OPTIONAL_DOCUMENTS = [
  { key: "certification", label: "Professional certification (optional)" },
] as const;

/**
 * Per-country document type requirements for background checks.
 * Each country has specific ID document types that are accepted.
 */
export const COUNTRY_DOCUMENT_TYPES = {
  CO: {
    name: "Colombia",
    types: [
      { code: "CC", label: "Cédula de Ciudadanía", description: "Colombian national ID card" },
      { code: "CE", label: "Cédula de Extranjería", description: "Foreigner ID card" },
      { code: "PA", label: "Passport", description: "Valid passport" },
    ],
  },
  PY: {
    name: "Paraguay",
    types: [
      { code: "CI", label: "Cédula de Identidad", description: "Paraguayan national ID card" },
      { code: "PA", label: "Passport", description: "Valid passport" },
    ],
  },
  UY: {
    name: "Uruguay",
    types: [
      { code: "CI", label: "Cédula de Identidad", description: "Uruguayan national ID card" },
      { code: "PA", label: "Passport", description: "Valid passport" },
    ],
  },
  AR: {
    name: "Argentina",
    types: [
      {
        code: "DNI",
        label: "Documento Nacional de Identidad",
        description: "Argentine national ID",
      },
      { code: "PA", label: "Passport", description: "Valid passport" },
    ],
  },
} as const;

export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const defaultActionState: OnboardingActionState = { status: "idle" };
