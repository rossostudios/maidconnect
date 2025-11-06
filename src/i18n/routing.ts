import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"], // English as global default
  defaultLocale: "en",
  localeCookie: {
    name: "NEXT_LOCALE",
    // Expires in 1 year
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
