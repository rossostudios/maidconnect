import { MetadataRoute } from "next";

/**
 * Robots.txt Generator
 *
 * Generates robots.txt for search engine crawler management.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://maidconnect.co";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/auth/sign-in",
          "/auth/sign-up",
          "/professionals",
          "/product/*",
          "/contact",
          "/privacy",
          "/terms",
        ],
        disallow: ["/api/*", "/dashboard/*", "/admin", "/support/account-suspended"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/api/*", "/dashboard/*", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
