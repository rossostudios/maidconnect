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
  blue: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
  green: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
  red: "bg-neutral-100 text-neutral-800 hover:bg-neutral-300",
  yellow: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  purple: "bg-neutral-100 text-purple-700 hover:bg-purple-200",
  gray: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
  pink: "bg-neutral-100 text-pink-700 hover:bg-pink-200",
  indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
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
