/**
 * Presentation Tool - Document Location Resolver (2025 Best Practices)
 *
 * Maps Sanity documents to their corresponding URLs in the Next.js app
 * This enables the Presentation Tool to show live previews of content
 * with automatic locale detection and proper URL generation
 */

import { map, type Observable } from "rxjs";
import type { DocumentLocationResolver } from "sanity/presentation";

export const locate: DocumentLocationResolver = (params, context) => {
  const { type } = params;

  // Helper to create query for document fields
  const createDocQuery = (fields: string) =>
    context.documentStore.listenQuery(
      `*[_id == $id][0]{${fields}}`,
      { id: params.id },
      { perspective: "previewDrafts" }
    ) as Observable<Record<string, unknown> | null>;

  switch (type) {
    case "helpArticle": {
      const doc$ = createDocQuery("title, slug, language");
      return doc$.pipe(
        map((doc) => {
          if (!(doc && doc.slug) || typeof doc.slug !== "object" || !("current" in doc.slug)) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const slug = doc.slug.current as string;
          const title = (doc.title as string) || "Untitled";

          return {
            locations: [
              {
                title,
                href: `/${locale}/help/${slug}`,
              },
            ],
          };
        })
      );
    }

    case "helpCategory": {
      const doc$ = createDocQuery("name, slug, language");
      return doc$.pipe(
        map((doc) => {
          if (!(doc && doc.slug) || typeof doc.slug !== "object" || !("current" in doc.slug)) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const slug = doc.slug.current as string;
          const title = (doc.name as string) || "Untitled";

          return {
            locations: [
              {
                title,
                href: `/${locale}/help/${slug}`,
              },
            ],
          };
        })
      );
    }

    case "changelog": {
      const doc$ = createDocQuery("title, slug, language");
      return doc$.pipe(
        map((doc) => {
          if (!(doc && doc.slug) || typeof doc.slug !== "object" || !("current" in doc.slug)) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const slug = doc.slug.current as string;
          const title = (doc.title as string) || "Untitled";

          return {
            locations: [
              {
                title,
                href: `/${locale}/changelog/${slug}`,
              },
            ],
          };
        })
      );
    }

    case "roadmapItem": {
      const doc$ = createDocQuery("title, slug, language");
      return doc$.pipe(
        map((doc) => {
          if (!doc) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const title = (doc.title as string) || "Untitled";

          // Check if slug exists and extract it
          let slug: string | null = null;
          if (doc.slug && typeof doc.slug === "object" && "current" in doc.slug) {
            slug = doc.slug.current as string;
          }

          return {
            locations: [
              {
                title,
                href: slug ? `/${locale}/roadmap#${slug}` : `/${locale}/roadmap`,
              },
            ],
          };
        })
      );
    }

    case "page": {
      const doc$ = createDocQuery("title, slug, language");
      return doc$.pipe(
        map((doc) => {
          if (!(doc && doc.slug) || typeof doc.slug !== "object" || !("current" in doc.slug)) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const slug = doc.slug.current as string;
          const title = (doc.title as string) || "Untitled";

          return {
            locations: [
              {
                title,
                href: `/${locale}/${slug}`,
              },
            ],
          };
        })
      );
    }

    case "cityPage": {
      const doc$ = createDocQuery("name, citySlug, language");
      return doc$.pipe(
        map((doc) => {
          if (
            !(doc && doc.citySlug) ||
            typeof doc.citySlug !== "object" ||
            !("current" in doc.citySlug)
          ) {
            return null;
          }

          const locale = typeof doc.language === "string" ? doc.language : "en";
          const slug = doc.citySlug.current as string;
          const title = (doc.name as string) || "Untitled";

          return {
            locations: [
              {
                title,
                href: `/${locale}/${slug}`,
              },
            ],
          };
        })
      );
    }

    default:
      return null;
  }
};
