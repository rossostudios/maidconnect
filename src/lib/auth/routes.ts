import type { AppRole } from "./types";

export const DASHBOARD_ROUTES: Record<AppRole, string> = {
  professional: "/dashboard/pro",
  customer: "/dashboard/customer",
  admin: "/admin",
};

export function getDashboardRouteForRole(role: AppRole): string {
  return DASHBOARD_ROUTES[role] ?? "/dashboard";
}

export const AUTH_ROUTES = {
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  signOut: "/auth/sign-out",
};
