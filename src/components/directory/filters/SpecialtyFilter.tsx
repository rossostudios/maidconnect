"use client";

/**
 * SpecialtyFilter - Lia Design System
 *
 * Specialty tag filters for professionals:
 * - English Speaking
 * - Pet Friendly
 * - Has Visa/Passport
 */

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type SpecialtyFilterProps = {
  englishSpeaking: boolean;
  petFriendly: boolean;
  hasPassport: boolean;
  onEnglishSpeakingChange: (value: boolean) => void;
  onPetFriendlyChange: (value: boolean) => void;
  onHasPassportChange: (value: boolean) => void;
  className?: string;
};

const specialties = [
  {
    id: "english-speaking",
    key: "englishSpeaking",
    label: "English Speaking",
    description: "Can communicate in English",
  },
  {
    id: "pet-friendly",
    key: "petFriendly",
    label: "Pet Friendly",
    description: "Comfortable working in homes with pets",
  },
  {
    id: "has-passport",
    key: "hasPassport",
    label: "Has Visa/Passport",
    description: "Available for travel assignments",
  },
] as const;

export function SpecialtyFilter({
  englishSpeaking,
  petFriendly,
  hasPassport,
  onEnglishSpeakingChange,
  onPetFriendlyChange,
  onHasPassportChange,
  className,
}: SpecialtyFilterProps) {
  const values = {
    englishSpeaking,
    petFriendly,
    hasPassport,
  };

  const handlers = {
    englishSpeaking: onEnglishSpeakingChange,
    petFriendly: onPetFriendlyChange,
    hasPassport: onHasPassportChange,
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section label */}
      <p className="font-medium text-neutral-700 text-sm dark:text-rausch-100">Specialty Tags</p>

      {/* Checkbox list */}
      <div aria-label="Specialty Tags" className="space-y-2" role="group">
        {specialties.map((spec) => (
          <div className="group flex cursor-pointer items-center gap-2.5" key={spec.id}>
            <Checkbox
              checked={values[spec.key]}
              className="h-4 w-4"
              id={spec.id}
              onCheckedChange={(checked) => handlers[spec.key](!!checked)}
            />
            <label
              className="cursor-pointer text-neutral-700 text-sm group-hover:text-neutral-900 dark:text-rausch-200 dark:group-hover:text-rausch-50"
              htmlFor={spec.id}
            >
              {spec.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
