"use client";

import { ChevronRight, Home } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

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
      <ol className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <li>
          <Link
            className="flex items-center gap-1.5 text-slate-600 transition hover:text-slate-900"
            href="/"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li className="flex items-center gap-2" key={index}>
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-400" />
            {item.href ? (
              <Link className="text-slate-600 transition hover:text-slate-900" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
