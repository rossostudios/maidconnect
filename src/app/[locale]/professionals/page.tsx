import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { DirectoryGridSkeleton } from "./DirectoryGridSkeleton";
import { ProfessionalsDirectory } from "./ProfessionalsDirectory";

export const metadata: Metadata = {
  title: "Find Professionals | Casaora",
  description:
    "Browse and book verified home service professionals in your area. Filter by location, service type, availability, and ratings.",
  openGraph: {
    title: "Find Professionals | Casaora",
    description: "Browse and book verified home service professionals in your area.",
  },
};

export default function ProfessionalsPage() {
  return (
    <div className="bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="min-h-screen">
        <Suspense fallback={<DirectoryGridSkeleton />}>
          <ProfessionalsDirectory />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
