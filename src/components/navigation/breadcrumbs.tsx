"use client";

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
  segments.forEach((segment, index) => {
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
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center gap-2 rounded-[28px] bg-white px-4 py-3 text-sm shadow-sm">
        <li>
          <Link
            className="flex items-center gap-1.5 text-[#7d7566] transition hover:text-[#8B7355]"
            href="/"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <span>Home</span>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li className="flex items-center gap-2" key={index}>
            <svg
              className="h-4 w-4 text-[#d4c9b8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            {item.href ? (
              <Link className="text-[#7d7566] transition hover:text-[#8B7355]" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[#211f1a]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
