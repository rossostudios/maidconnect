"use client";

import { ArrowRight01Icon, Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Breadcrumbs - Lia Design System
 *
 * Matches the high-contrast admin dashboard aesthetic:
 * - Geist Sans font with specific weights
 * - Orange (#FF5200) hover states
 * - Uppercase with tracking-wider
 * - Clean, minimal style
 */
export function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumb items
  let currentPath = "";
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (!segment) {
      continue;
    }

    currentPath += `/${segment}`;

    // Format label
    let label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Custom labels for specific paths
    if (segment === "pro") {
      label = "Professional";
    } else if (segment === "customer") {
      label = "Customer";
    }

    // Last item should not have href
    if (index === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none items-center gap-2 p-0">
        <li className="m-0 p-0">
          <Link
            className={cn(
              "flex items-center gap-2 font-normal text-neutral-700 text-xs uppercase tracking-wider transition-colors hover:text-[#FF5200]",
              geistSans.className
            )}
            href="/"
          >
            <HugeiconsIcon className="h-4 w-4 flex-shrink-0" icon={Home01Icon} />
            <span>Home</span>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li className="m-0 flex items-center gap-2 p-0" key={index}>
            <HugeiconsIcon
              aria-hidden="true"
              className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400"
              icon={ArrowRight01Icon}
            />
            {item.href ? (
              <Link
                className={cn(
                  "font-normal text-neutral-700 text-xs uppercase tracking-wider transition-colors hover:text-[#FF5200]",
                  geistSans.className
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
