import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // English (en) = Global default (like Airbnb)
  // Spanish (es) = Available for LATAM markets (CO, PY, UY, AR)
  locales: ["en", "es"],
  defaultLocale: "en",
  localeCookie: {
    name: "NEXT_LOCALE",
    // Expires in 1 year
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { Link, usePathname, useRouter } = createNavigation(routing);
