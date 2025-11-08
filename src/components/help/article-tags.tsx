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
  blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  green: "bg-green-100 text-green-700 hover:bg-green-200",
  red: "bg-red-100 text-red-700 hover:bg-red-200",
  yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  pink: "bg-pink-100 text-pink-700 hover:bg-pink-200",
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
