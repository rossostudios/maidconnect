"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type ArticleTag = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

type ArticleTagsProps = {
  tags: ArticleTag[];
  locale: string;
  className?: string;
};

const colorMap = {
  blue: "bg-babu-100 text-babu-700 hover:bg-babu-200 dark:bg-babu-900/30 dark:text-babu-300 dark:hover:bg-babu-800/40",
  green: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40",
  red: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40",
  orange: "bg-rausch-100 text-rausch-700 hover:bg-rausch-200 dark:bg-rausch-900/30 dark:text-rausch-300 dark:hover:bg-rausch-800/40",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40",
  gray: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
  pink: "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/40",
  indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/40",
};

export function ArticleTags({ tags, locale, className }: ArticleTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Link
          className={cn(
            "rounded-full px-3 py-1 font-medium text-sm transition",
            colorMap[tag.color as keyof typeof colorMap] || colorMap.gray
          )}
          href={`/${locale}/help?tag=${tag.slug}`}
          key={tag.id}
        >
          {locale === "es" ? tag.name_es : tag.name_en}
        </Link>
      ))}
    </div>
  );
}
