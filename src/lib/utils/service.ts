// Service field mapper - Extract repetitive field mapping logic

import type { ServiceInput } from "@/types";

type FieldMapping = {
  inputKey: keyof ServiceInput;
  dbKey: string;
  includeIfUndefined?: boolean;
};

// Define field mappings to reduce repetitive conditional logic
const FIELD_MAPPINGS: FieldMapping[] = [
  { inputKey: "name", dbKey: "name" },
  { inputKey: "description", dbKey: "description", includeIfUndefined: true },
  { inputKey: "categoryId", dbKey: "category_id", includeIfUndefined: true },
  { inputKey: "serviceType", dbKey: "service_type" },
  { inputKey: "basePriceCop", dbKey: "base_price_cop", includeIfUndefined: true },
  { inputKey: "pricingUnit", dbKey: "pricing_unit" },
  {
    inputKey: "estimatedDurationMinutes",
    dbKey: "estimated_duration_minutes",
    includeIfUndefined: true,
  },
  { inputKey: "minDurationMinutes", dbKey: "min_duration_minutes", includeIfUndefined: true },
  { inputKey: "maxDurationMinutes", dbKey: "max_duration_minutes", includeIfUndefined: true },
  { inputKey: "requiresApproval", dbKey: "requires_approval", includeIfUndefined: true },
  {
    inputKey: "advanceBookingHours",
    dbKey: "advance_booking_hours",
    includeIfUndefined: true,
  },
  {
    inputKey: "maxBookingDaysAhead",
    dbKey: "max_booking_days_ahead",
    includeIfUndefined: true,
  },
  { inputKey: "requirements", dbKey: "requirements", includeIfUndefined: true },
  { inputKey: "includedItems", dbKey: "included_items", includeIfUndefined: true },
];

/**
 * Map service input fields to database update object
 * Reduces complexity by replacing 14+ conditional statements with declarative mapping
 */
export function mapServiceInputToUpdateData(input: Partial<ServiceInput>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};

  for (const mapping of FIELD_MAPPINGS) {
    const value = input[mapping.inputKey];

    // Include field if it has a value, or if undefined values should be included
    if ((value !== undefined || mapping.includeIfUndefined) && value !== undefined) {
      updateData[mapping.dbKey] = value;
    }
  }

  return updateData;
}
