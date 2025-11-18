/**
 * Conditional Announcement Banner
 *
 * Only displays AnnouncementBanner on marketing pages.
 * Hides on dashboard routes (/admin, /professional, /user, /dashboard).
 */

"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBanner } from "./AnnouncementBanner";

/**
 * Routes where announcement banner should NOT be shown
 */
const DASHBOARD_ROUTES = ["/admin", "/professional", "/user", "/dashboard"];

/**
 * Regex to match locale prefix in pathname
 */
const LOCALE_PREFIX_REGEX = /^\/[a-z]{2}\//;

/**
 * Check if current path is a dashboard route
 */
function isDashboardRoute(pathname: string): boolean {
  // Remove locale prefix (e.g., "/en/admin" → "/admin")
  const pathWithoutLocale = pathname.replace(LOCALE_PREFIX_REGEX, "/");

  return DASHBOARD_ROUTES.some((route) => pathWithoutLocale.startsWith(route));
}

/**
 * Conditionally render AnnouncementBanner only on marketing pages
 */
export function ConditionalAnnouncementBanner() {
  const pathname = usePathname();

  // Hide banner on dashboard routes
  if (isDashboardRoute(pathname)) {
    return null;
  }

  // Show banner on marketing pages
  return <AnnouncementBanner />;
}
