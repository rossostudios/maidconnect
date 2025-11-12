import type { AppRole } from "./types";

export const DASHBOARD_ROUTES: Record<AppRole, string> = {
  professional: "/dashboard/pro",
  customer: "/dashboard/customer",
  admin: "/admin",
};

export function getDashboardRouteForRole(role: AppRole, locale?: string): string {
  const path = DASHBOARD_ROUTES[role] ?? "/dashboard";
  return locale ? `/${locale}${path}` : path;
}

export const AUTH_ROUTES = {
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  signOut: "/auth/sign-out",
};

export function getAuthRoute(route: keyof typeof AUTH_ROUTES, locale?: string): string {
  const path = AUTH_ROUTES[route];
  return locale ? `/${locale}${path}` : path;
}
