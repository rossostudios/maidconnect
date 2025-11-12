/**
 * Sanity Studio Layout
 * Minimal layout for the Studio - removes all app chrome
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio | Casaora",
  description: "Content management for Casaora",
  robots: {
    index: false, // Don't index the Studio in search engines
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
