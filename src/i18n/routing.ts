import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Spanish (es) = Default for LATAM markets (CO, PY, UY, AR)
  // English (en) = Available for expats, tourists, international users
  locales: ["en", "es"],
  defaultLocale: "es",
  localeCookie: {
    name: "NEXT_LOCALE",
    // Expires in 1 year
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
