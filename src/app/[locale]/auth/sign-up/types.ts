export type SignUpActionState = {
  status: "idle" | "error" | "success";
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const defaultSignUpState: SignUpActionState = { status: "idle" };
