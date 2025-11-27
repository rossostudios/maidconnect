/**
 * FeaturedProfessionalsSection - Homepage Featured Professionals
 *
 * Airbnb-inspired carousel section displaying:
 * - Top-rated professionals
 * - Recently active professionals
 * - Category-filtered professionals
 *
 * Following Lia Design System.
 * Using "The Core Four" service categories.
 */

"use client";

import {
  Home01Icon,
  Restaurant01Icon,
  SparklesIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import {
  CategoryCarousel,
  FeaturedCarousel,
  type FeaturedProfessional,
  type ServiceCategory,
} from "@/components/search";
import { cn } from "@/lib/utils/core";

// Mock featured professionals data
// In production, this would come from an API endpoint
// Using "The Core Four" service categories
const FEATURED_PROFESSIONALS: FeaturedProfessional[] = [
  {
    id: "pro-1",
    name: "María González",
    service: "Standard Cleaning",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 35_000,
    currency: "COP",
    verified: true,
    featured: true,
    location: "Bogotá, Colombia",
  },
  {
    id: "pro-2",
    name: "Carlos Rodríguez",
    service: "Deep Clean / Move-out",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 45_000,
    currency: "COP",
    verified: true,
    badge: "Top Rated",
    location: "Medellín, Colombia",
  },
  {
    id: "pro-3",
    name: "Ana Martínez",
    service: "Nanny & Childcare",
    rating: 4.9,
    reviewCount: 64,
    hourlyRate: 50_000,
    currency: "COP",
    verified: true,
    location: "Bogotá, Colombia",
  },
  {
    id: "pro-4",
    name: "Juan Pérez",
    service: "Laundry & Ironing",
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 30_000,
    currency: "COP",
    verified: true,
    featured: true,
    location: "Cali, Colombia",
  },
  {
    id: "pro-5",
    name: "Lucía Fernández",
    service: "Senior Companionship",
    rating: 4.8,
    reviewCount: 43,
    hourlyRate: 32_000,
    currency: "COP",
    verified: true,
    location: "Cartagena, Colombia",
  },
  {
    id: "pro-6",
    name: "Roberto Silva",
    service: "Meal Prep / Private Chef",
    rating: 4.6,
    reviewCount: 78,
    hourlyRate: 40_000,
    currency: "COP",
    verified: true,
    badge: "Fast Response",
    location: "Barranquilla, Colombia",
  },
  {
    id: "pro-7",
    name: "Carmen López",
    service: "Event Cooking",
    rating: 4.9,
    reviewCount: 95,
    hourlyRate: 55_000,
    currency: "COP",
    verified: true,
    location: "Asunción, Paraguay",
  },
  {
    id: "pro-8",
    name: "Diego Morales",
    service: "Standard Cleaning",
    rating: 4.8,
    reviewCount: 112,
    hourlyRate: 48_000,
    currency: "COP",
    verified: true,
    featured: true,
    location: "Montevideo, Uruguay",
  },
];

// Categories for filtering - "The Core Four" structure
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "all", label: "All", icon: SparklesIcon },
  { id: "cleaning", label: "Home & Cleaning", icon: Home01Icon },
  { id: "family", label: "Family Care", icon: UserGroupIcon },
  { id: "kitchen", label: "Kitchen", icon: Restaurant01Icon },
];

// Map category IDs to service keywords for filtering
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cleaning: ["Cleaning", "Laundry", "Ironing", "Move-out"],
  family: ["Childcare", "Nanny", "Senior", "Companionship"],
  kitchen: ["Meal", "Chef", "Cooking", "Event"],
};

export function FeaturedProfessionalsSection() {
  const t = useTranslations("home.featuredProfessionals");
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter professionals by category using keyword matching
  const filteredProfessionals =
    activeCategory === "all"
      ? FEATURED_PROFESSIONALS
      : FEATURED_PROFESSIONALS.filter((pro) => {
          const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
          return keywords.some((keyword) =>
            pro.service.toLowerCase().includes(keyword.toLowerCase())
          );
        });

  return (
    <section className="bg-white py-16 md:py-24 dark:bg-background">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2
            className={cn(
              "font-bold text-2xl text-neutral-900 tracking-tight md:text-3xl dark:text-neutral-50",
              geistSans.className
            )}
          >
            {t("title")}
          </h2>
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400",
              geistSans.className
            )}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryCarousel
            activeCategory={activeCategory}
            categories={SERVICE_CATEGORIES}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Featured Professionals Carousel */}
        <FeaturedCarousel
          cardVariant="expanded"
          professionals={filteredProfessionals}
          subtitle={t("available", { count: filteredProfessionals.length })}
          title=""
        />

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-neutral-800 dark:border dark:border-border dark:bg-card dark:hover:bg-muted",
              geistSans.className
            )}
            href="/professionals"
          >
            {t("browseAll")}
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
