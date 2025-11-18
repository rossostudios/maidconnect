import { describe, expect, it } from "vitest";
import type { ServiceInput } from "@/types";
import { mapServiceInputToUpdateData } from "../service";

describe("mapServiceInputToUpdateData", () => {
  describe("required fields", () => {
    it("maps name to database field", () => {
      const input: Partial<ServiceInput> = {
        name: "House Cleaning",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "House Cleaning",
      });
    });

    it("maps serviceType to snake_case", () => {
      const input: Partial<ServiceInput> = {
        serviceType: "cleaning",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        service_type: "cleaning",
      });
    });

    it("maps pricingUnit to snake_case", () => {
      const input: Partial<ServiceInput> = {
        pricingUnit: "hourly",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        pricing_unit: "hourly",
      });
    });
  });

  describe("optional fields with includeIfUndefined", () => {
    it("maps description when provided", () => {
      const input: Partial<ServiceInput> = {
        description: "Professional house cleaning service",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        description: "Professional house cleaning service",
      });
    });

    it("omits description when undefined", () => {
      const input: Partial<ServiceInput> = {
        name: "Cleaning",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).not.toHaveProperty("description");
    });

    it("maps categoryId to category_id", () => {
      const input: Partial<ServiceInput> = {
        categoryId: "cat-123",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        category_id: "cat-123",
      });
    });

    it("maps basePriceCop to base_price_cop", () => {
      const input: Partial<ServiceInput> = {
        basePriceCop: 50_000,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        base_price_cop: 50_000,
      });
    });
  });

  describe("duration fields", () => {
    it("maps estimatedDurationMinutes to snake_case", () => {
      const input: Partial<ServiceInput> = {
        estimatedDurationMinutes: 120,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        estimated_duration_minutes: 120,
      });
    });

    it("maps minDurationMinutes to snake_case", () => {
      const input: Partial<ServiceInput> = {
        minDurationMinutes: 60,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        min_duration_minutes: 60,
      });
    });

    it("maps maxDurationMinutes to snake_case", () => {
      const input: Partial<ServiceInput> = {
        maxDurationMinutes: 240,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        max_duration_minutes: 240,
      });
    });

    it("maps all duration fields together", () => {
      const input: Partial<ServiceInput> = {
        estimatedDurationMinutes: 120,
        minDurationMinutes: 60,
        maxDurationMinutes: 240,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        estimated_duration_minutes: 120,
        min_duration_minutes: 60,
        max_duration_minutes: 240,
      });
    });
  });

  describe("booking configuration fields", () => {
    it("maps requiresApproval to snake_case", () => {
      const input: Partial<ServiceInput> = {
        requiresApproval: true,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        requires_approval: true,
      });
    });

    it("maps advanceBookingHours to snake_case", () => {
      const input: Partial<ServiceInput> = {
        advanceBookingHours: 24,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        advance_booking_hours: 24,
      });
    });

    it("maps maxBookingDaysAhead to snake_case", () => {
      const input: Partial<ServiceInput> = {
        maxBookingDaysAhead: 30,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        max_booking_days_ahead: 30,
      });
    });
  });

  describe("array fields", () => {
    it("maps requirements array", () => {
      const input: Partial<ServiceInput> = {
        requirements: ["ID verification", "Background check"],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        requirements: ["ID verification", "Background check"],
      });
    });

    it("maps includedItems array", () => {
      const input: Partial<ServiceInput> = {
        includedItems: ["Cleaning supplies", "Equipment"],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        included_items: ["Cleaning supplies", "Equipment"],
      });
    });

    it("handles empty arrays", () => {
      const input: Partial<ServiceInput> = {
        requirements: [],
        includedItems: [],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        requirements: [],
        included_items: [],
      });
    });
  });

  describe("complete service input", () => {
    it("maps all fields correctly in a full service object", () => {
      const input: Partial<ServiceInput> = {
        name: "Premium House Cleaning",
        description: "Professional deep cleaning service",
        categoryId: "cat-cleaning-001",
        serviceType: "cleaning",
        basePriceCop: 80_000,
        pricingUnit: "hourly",
        estimatedDurationMinutes: 180,
        minDurationMinutes: 120,
        maxDurationMinutes: 300,
        requiresApproval: false,
        advanceBookingHours: 48,
        maxBookingDaysAhead: 60,
        requirements: ["Verified ID", "Clean criminal record"],
        includedItems: ["Eco-friendly supplies", "Professional equipment"],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "Premium House Cleaning",
        description: "Professional deep cleaning service",
        category_id: "cat-cleaning-001",
        service_type: "cleaning",
        base_price_cop: 80_000,
        pricing_unit: "hourly",
        estimated_duration_minutes: 180,
        min_duration_minutes: 120,
        max_duration_minutes: 300,
        requires_approval: false,
        advance_booking_hours: 48,
        max_booking_days_ahead: 60,
        requirements: ["Verified ID", "Clean criminal record"],
        included_items: ["Eco-friendly supplies", "Professional equipment"],
      });
    });
  });

  describe("partial updates", () => {
    it("only includes provided fields", () => {
      const input: Partial<ServiceInput> = {
        name: "Updated Service Name",
        basePriceCop: 60_000,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "Updated Service Name",
        base_price_cop: 60_000,
      });
    });

    it("handles single field update", () => {
      const input: Partial<ServiceInput> = {
        requiresApproval: true,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        requires_approval: true,
      });
    });

    it("handles multiple fields from different categories", () => {
      const input: Partial<ServiceInput> = {
        name: "Quick Clean",
        estimatedDurationMinutes: 90,
        advanceBookingHours: 12,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "Quick Clean",
        estimated_duration_minutes: 90,
        advance_booking_hours: 12,
      });
    });
  });

  describe("edge cases", () => {
    it("handles empty input object", () => {
      const input: Partial<ServiceInput> = {};

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({});
    });

    it("preserves zero values", () => {
      const input: Partial<ServiceInput> = {
        basePriceCop: 0,
        estimatedDurationMinutes: 0,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        base_price_cop: 0,
        estimated_duration_minutes: 0,
      });
    });

    it("preserves false boolean values", () => {
      const input: Partial<ServiceInput> = {
        requiresApproval: false,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        requires_approval: false,
      });
    });

    it("preserves null values for optional fields", () => {
      const input: Partial<ServiceInput> = {
        description: null as unknown as string,
        categoryId: null as unknown as string,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        description: null,
        category_id: null,
      });
    });

    it("handles empty string values", () => {
      const input: Partial<ServiceInput> = {
        name: "",
        description: "",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "",
        description: "",
      });
    });

    it("does not include undefined values for non-includeIfUndefined fields", () => {
      const input: Partial<ServiceInput> = {
        name: "Service",
        // serviceType is required but not provided (undefined)
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toEqual({
        name: "Service",
      });
      expect(result).not.toHaveProperty("service_type");
    });
  });

  describe("data type preservation", () => {
    it("preserves number types", () => {
      const input: Partial<ServiceInput> = {
        basePriceCop: 50_000,
        estimatedDurationMinutes: 120,
        advanceBookingHours: 24,
        maxBookingDaysAhead: 30,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(typeof result.base_price_cop).toBe("number");
      expect(typeof result.estimated_duration_minutes).toBe("number");
      expect(typeof result.advance_booking_hours).toBe("number");
      expect(typeof result.max_booking_days_ahead).toBe("number");
    });

    it("preserves boolean types", () => {
      const input: Partial<ServiceInput> = {
        requiresApproval: true,
      };

      const result = mapServiceInputToUpdateData(input);

      expect(typeof result.requires_approval).toBe("boolean");
    });

    it("preserves string types", () => {
      const input: Partial<ServiceInput> = {
        name: "Service",
        description: "Description",
        serviceType: "cleaning",
      };

      const result = mapServiceInputToUpdateData(input);

      expect(typeof result.name).toBe("string");
      expect(typeof result.description).toBe("string");
      expect(typeof result.service_type).toBe("string");
    });

    it("preserves array types", () => {
      const input: Partial<ServiceInput> = {
        requirements: ["item1", "item2"],
        includedItems: ["item3", "item4"],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(Array.isArray(result.requirements)).toBe(true);
      expect(Array.isArray(result.included_items)).toBe(true);
    });
  });

  describe("snake_case conversion accuracy", () => {
    it("converts all camelCase fields to snake_case correctly", () => {
      const input: Partial<ServiceInput> = {
        categoryId: "cat-1",
        serviceType: "type",
        basePriceCop: 1000,
        pricingUnit: "unit",
        estimatedDurationMinutes: 60,
        minDurationMinutes: 30,
        maxDurationMinutes: 90,
        requiresApproval: true,
        advanceBookingHours: 12,
        maxBookingDaysAhead: 14,
        includedItems: [],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toHaveProperty("category_id");
      expect(result).toHaveProperty("service_type");
      expect(result).toHaveProperty("base_price_cop");
      expect(result).toHaveProperty("pricing_unit");
      expect(result).toHaveProperty("estimated_duration_minutes");
      expect(result).toHaveProperty("min_duration_minutes");
      expect(result).toHaveProperty("max_duration_minutes");
      expect(result).toHaveProperty("requires_approval");
      expect(result).toHaveProperty("advance_booking_hours");
      expect(result).toHaveProperty("max_booking_days_ahead");
      expect(result).toHaveProperty("included_items");
    });

    it("does not convert simple field names", () => {
      const input: Partial<ServiceInput> = {
        name: "Service",
        description: "Description",
        requirements: [],
      };

      const result = mapServiceInputToUpdateData(input);

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("requirements");
      // These stay the same (no underscores)
      expect(result.name).toBe("Service");
      expect(result.description).toBe("Description");
    });
  });
});
