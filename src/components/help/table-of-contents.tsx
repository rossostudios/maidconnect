"use client";

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
    <div className={cn("sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto", className)}>
      <h4 className="mb-3 font-semibold text-gray-900 text-sm">{t("toc.title")}</h4>
      <nav>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}>
              <a
                className={cn(
                  "block transition hover:text-[#E85D48]",
                  activeId === heading.id ? "font-medium text-[#E85D48]" : "text-gray-600"
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
  );
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
