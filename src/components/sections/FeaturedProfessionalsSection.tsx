/**
 * FeaturedProfessionalsSection - Homepage Featured Professionals
 *
 * Airbnb-inspired carousel section displaying:
 * - Top-rated professionals
 * - Recently active professionals
 * - Category-filtered professionals
 *
 * Following Lia Design System.
 */

"use client";

import {
  CleaningBucketIcon,
  FlashIcon,
  Home09Icon,
  SparklesIcon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";
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
const FEATURED_PROFESSIONALS: FeaturedProfessional[] = [
  {
    id: "pro-1",
    name: "María González",
    service: "House Cleaning",
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
    service: "Plumbing",
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
    service: "Electrical",
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
    service: "Handyman",
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
    service: "Gardening",
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
    service: "Painting",
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
    service: "Moving",
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
    service: "Appliance Repair",
    rating: 4.8,
    reviewCount: 112,
    hourlyRate: 48_000,
    currency: "COP",
    verified: true,
    featured: true,
    location: "Montevideo, Uruguay",
  },
];

// Categories for filtering
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "all", label: "All", icon: SparklesIcon },
  { id: "cleaning", label: "Cleaning", icon: CleaningBucketIcon },
  { id: "electrical", label: "Electrical", icon: FlashIcon },
  { id: "handyman", label: "Handyman", icon: ToolsIcon },
  { id: "home", label: "Home", icon: Home09Icon },
];

export function FeaturedProfessionalsSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter professionals by category
  const filteredProfessionals =
    activeCategory === "all"
      ? FEATURED_PROFESSIONALS
      : FEATURED_PROFESSIONALS.filter((pro) =>
          pro.service.toLowerCase().includes(activeCategory.toLowerCase())
        );

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
            Top-Rated Professionals
          </h2>
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400",
              geistSans.className
            )}
          >
            Discover verified professionals trusted by thousands of customers in your area
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
          subtitle={`${filteredProfessionals.length} professionals available`}
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
            Browse All Professionals
            <svg
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
