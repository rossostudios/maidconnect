// Helper functions to reduce complexity in mapRowToDirectoryProfessional

import type { VerificationLevel } from "@/components/professionals/verification-badge";

type Service = {
  name?: string | null;
  hourlyRateCop?: number | null;
};

/**
 * Extracts the primary service name from parsed services or fallback array
 */
export function extractPrimaryService(
  services: Service[],
  primaryServices: string[] | null
): string | null {
  const serviceWithName = services.find((service) => Boolean(service.name));
  if (serviceWithName?.name) {
    return serviceWithName.name;
  }

  if (primaryServices && primaryServices.length > 0) {
    return primaryServices[0] ?? null;
  }

  return null;
}

/**
 * Extracts the hourly rate from the first service that has one
 */
export function extractHourlyRate(services: Service[]): number | null {
  const serviceWithRate = services.find((service) => typeof service.hourlyRateCop === "number");
  return serviceWithRate?.hourlyRateCop ?? null;
}

/**
 * Validates and returns a proper verification level
 */
export function parseVerificationLevel(level: string | null | undefined): VerificationLevel {
  if (!level) {
    return "none";
  }

  const validLevels: VerificationLevel[] = ["basic", "enhanced", "background-check"];

  if (validLevels.includes(level as VerificationLevel)) {
    return level as VerificationLevel;
  }

  return "none";
}

/**
 * Filters and type-guards a language array to ensure all entries are strings
 */
export function filterLanguages(languages: string[] | null | undefined): string[] {
  if (!Array.isArray(languages)) {
    return [];
  }

  return languages.filter((lang): lang is string => typeof lang === "string");
}
