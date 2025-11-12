// Booking field mapper - Extract repetitive field mapping logic

import type { UpdateBookingInput } from "@/types";

type FieldMapping = {
  inputKey: keyof UpdateBookingInput;
  dbKey: string;
  includeIfUndefined?: boolean;
};

// Define field mappings to reduce repetitive conditional logic
const FIELD_MAPPINGS: FieldMapping[] = [
  { inputKey: "scheduledDate", dbKey: "scheduled_date" },
  { inputKey: "scheduledStartTime", dbKey: "scheduled_start_time" },
  { inputKey: "scheduledEndTime", dbKey: "scheduled_end_time" },
  { inputKey: "serviceAddressId", dbKey: "service_address_id", includeIfUndefined: true },
  {
    inputKey: "serviceAddressLine1",
    dbKey: "service_address_line1",
    includeIfUndefined: true,
  },
  {
    inputKey: "serviceAddressLine2",
    dbKey: "service_address_line2",
    includeIfUndefined: true,
  },
  { inputKey: "serviceAddressCity", dbKey: "service_address_city", includeIfUndefined: true },
  {
    inputKey: "servicePostalCode",
    dbKey: "service_address_postal_code",
    includeIfUndefined: true,
  },
  { inputKey: "customerNotes", dbKey: "customer_notes", includeIfUndefined: true },
  { inputKey: "professionalNotes", dbKey: "professional_notes", includeIfUndefined: true },
  { inputKey: "specialRequirements", dbKey: "special_requirements", includeIfUndefined: true },
  { inputKey: "status", dbKey: "status" },
];

/**
 * Map booking input fields to database update object
 * Reduces complexity by replacing 12+ conditional statements with declarative mapping
 */
export function mapBookingInputToUpdateData(
  input: Partial<UpdateBookingInput>
): Record<string, unknown> {
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
