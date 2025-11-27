"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  className?: string;
};

export function TableOfContents({ className }: TableOfContentsProps) {
  const t = useTranslations("help.article");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract h2, h3 from article
    const article = document.querySelector(".prose");
    if (!article) {
      return;
    }

    const elements = article.querySelectorAll("h2, h3");
    if (elements.length === 0) {
      return;
    }

    const toc: Heading[] = Array.from(elements).map((el) => ({
      id: el.id || generateId(el.textContent || ""),
      text: el.textContent || "",
      level: Number.parseInt(el.tagName[1] ?? "2", 10),
    }));

    // Add IDs if missing
    elements.forEach((el, i) => {
      if (!el.id && toc[i]) {
        el.id = toc[i].id;
      }
    });

    setHeadings(toc);

    // Intersection observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto",
        className
      )}
    >
      {/* Mobile: Collapsible disclosure button */}
      <button
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-neutral-50 lg:hidden dark:border-border dark:bg-card dark:hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="font-medium text-neutral-900 text-sm dark:text-neutral-50">
          {t("toc.title")} ({headings.length})
        </span>
        <HugeiconsIcon
          className={cn(
            "h-4 w-4 text-neutral-500 transition-transform dark:text-neutral-400",
            isOpen && "rotate-180"
          )}
          icon={ArrowDown01Icon}
        />
      </button>

      {/* Mobile: Collapsible content */}
      <div className={cn("mt-2 lg:hidden", !isOpen && "hidden")}>
        <nav>
          <ul className="space-y-1 rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-border dark:bg-card">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingLeft: heading.level === 3 ? "0.75rem" : "0",
                }}
              >
                <a
                  className={cn(
                    "block rounded px-2 py-1.5 transition-colors",
                    activeId === heading.id
                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-muted dark:text-neutral-50"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-muted dark:hover:text-neutral-50"
                  )}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setIsOpen(false); // Close on mobile after selection
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop: Always visible with minimal Notion-style */}
      <div className="hidden lg:block">
        <h4 className="mb-4 text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400">
          {t("toc.title")}
        </h4>
        <nav>
          <ul className="space-y-1 border-neutral-200 border-l pl-3 text-sm dark:border-border">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingLeft: heading.level === 3 ? "0.75rem" : "0",
                }}
              >
                <a
                  className={cn(
                    "block py-1 transition-colors",
                    activeId === heading.id
                      ? "font-medium text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                  )}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
