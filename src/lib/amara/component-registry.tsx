/**
 * Amara Component Registry
 *
 * Maps tool names to their corresponding React component generators.
 * This is the glue between AI tool calls and rendered UI components.
 */

import type { ReactNode } from "react";

/**
 * Tool component generator type
 */
export type ToolComponentGenerator = {
  /**
   * Description of what this tool does
   */
  description: string;

  /**
   * Generate the loading state component
   */
  loading: (params?: any) => ReactNode;

  /**
   * Generate the result component
   */
  result: (data: any) => ReactNode;

  /**
   * Generate the error component
   */
  error: (error: string) => ReactNode;
};

/**
 * Component registry mapping tool names to generators
 */
export const TOOL_COMPONENT_REGISTRY: Record<string, ToolComponentGenerator> = {
  searchProfessionals: {
    description: "Search for cleaning professionals",
    loading: (params) => (
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-neutral-700">
          Searching for {params?.serviceType || "cleaning"} professionals
          {params?.city ? ` in ${params.city}` : ""}...
        </span>
      </div>
    ),
    result: (data) => {
      // Component will be dynamically imported
      // Placeholder for now
      return (
        <div className="space-y-4">
          {data.professionals?.map((pro: any) => (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4" key={pro.id}>
              <div className="font-medium text-neutral-900">{pro.name}</div>
              <div className="text-neutral-600 text-sm">{pro.service}</div>
              <div className="mt-2 text-neutral-700 text-sm">
                ⭐ {pro.rating.toFixed(1)} ({pro.reviewCount} reviews)
              </div>
              {pro.hourlyRateCop && (
                <div className="mt-1 font-medium text-orange-600 text-sm">
                  {pro.hourlyRateCop.toLocaleString()} COP/hour
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },
    error: (error) => (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error || "Failed to search professionals"}
      </div>
    ),
  },

  checkAvailability: {
    description: "Check professional availability",
    loading: () => (
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-neutral-700">Checking availability...</span>
      </div>
    ),
    result: (data) => {
      // Component will be dynamically imported
      // Placeholder for now
      return (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4">
          <div className="font-medium text-neutral-900">Availability Confirmed</div>
          <div className="mt-2 text-neutral-700 text-sm">
            Available from {data.startDate} to {data.endDate}
          </div>
        </div>
      );
    },
    error: (error) => (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error || "Failed to check availability"}
      </div>
    ),
  },

  createBookingDraft: {
    description: "Create booking draft",
    loading: () => (
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-neutral-700">Preparing your booking...</span>
      </div>
    ),
    result: (data) => {
      // Component will be dynamically imported
      // Placeholder for now
      const draft = data.bookingDraft;
      return (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4">
          <div className="font-medium text-neutral-900">Booking Draft</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="font-medium">Professional:</span> {draft.professionalName}
            </div>
            <div>
              <span className="font-medium">Service:</span> {draft.serviceName}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {draft.durationHours} hours
            </div>
            <div>
              <span className="font-medium">Estimated Cost:</span>{" "}
              {draft.estimatedCostCop.toLocaleString()} COP
            </div>
          </div>
        </div>
      );
    },
    error: (error) => (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error || "Failed to create booking draft"}
      </div>
    ),
  },
};

/**
 * Get component generator for a tool
 */
export function getToolComponentGenerator(toolName: string): ToolComponentGenerator | null {
  return TOOL_COMPONENT_REGISTRY[toolName] || null;
}

/**
 * Check if a tool has a component generator
 */
export function hasToolComponent(toolName: string): boolean {
  return toolName in TOOL_COMPONENT_REGISTRY;
}
