// Roadmap field mapper - Extract repetitive field mapping logic

import type { RoadmapItemInput } from "@/types/roadmap";
import { generateRoadmapSlug } from "@/types/roadmap";

export type RoadmapUpdateContext = {
  existingItem: {
    status: string;
    published_at: string | null;
  };
  body: Partial<RoadmapItemInput>;
};

type FieldMapping = {
  inputKey: keyof RoadmapItemInput;
  dbKey: string;
  includeIfUndefined?: boolean;
};

// Define field mappings to reduce repetitive conditional logic
const FIELD_MAPPINGS: FieldMapping[] = [
  { inputKey: "description", dbKey: "description", includeIfUndefined: true },
  { inputKey: "status", dbKey: "status", includeIfUndefined: true },
  { inputKey: "category", dbKey: "category", includeIfUndefined: true },
  { inputKey: "priority", dbKey: "priority", includeIfUndefined: true },
  { inputKey: "target_quarter", dbKey: "target_quarter", includeIfUndefined: true },
  { inputKey: "visibility", dbKey: "visibility", includeIfUndefined: true },
  { inputKey: "target_audience", dbKey: "target_audience", includeIfUndefined: true },
  { inputKey: "tags", dbKey: "tags", includeIfUndefined: true },
  { inputKey: "featured_image_url", dbKey: "featured_image_url", includeIfUndefined: true },
  { inputKey: "metadata", dbKey: "metadata", includeIfUndefined: true },
];

/**
 * Map roadmap input fields to database update object
 * Reduces complexity by replacing 12+ conditional statements with declarative mapping
 */
export function mapRoadmapInputToUpdateData(
  context: RoadmapUpdateContext
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  const { body, existingItem } = context;

  // Handle title and slug (special case - connected fields)
  if (body.title !== undefined) {
    updateData.title = body.title;
    // Auto-update slug if title changed and no explicit slug provided
    if (!body.slug) {
      updateData.slug = generateRoadmapSlug(body.title);
    }
  }

  if (body.slug !== undefined) {
    updateData.slug = body.slug;
  }

  // Map all other fields using declarative mapping
  for (const mapping of FIELD_MAPPINGS) {
    const value = body[mapping.inputKey];

    if ((value !== undefined || mapping.includeIfUndefined) && value !== undefined) {
      updateData[mapping.dbKey] = value;
    }
  }

  // Handle visibility published_at timestamp
  if (body.visibility === "published" && !existingItem.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  // Handle status shipped_at timestamp
  if (body.status === "shipped" && existingItem.status !== "shipped") {
    updateData.shipped_at = new Date().toISOString();
  }

  return updateData;
}
