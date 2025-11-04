import { useActionState, useEffect } from "react";
import type { ProfessionalService } from "@/lib/professionals/transformers";
import type { ServiceAddon } from "@/components/service-addons/service-addons-manager";
import type { SavedAddress } from "@/components/addresses/saved-addresses-manager";

type BookingData = {
  serviceName: string;
  serviceHourlyRate: number | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  durationHours: number;
  address: SavedAddress | null;
  customAddress?: string;
  selectedAddons: ServiceAddon[];
  specialInstructions: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: "weekly" | "biweekly" | "monthly";
    endDate?: string;
  };
};

type SubmissionState = {
  status: "idle" | "success" | "error";
  error: string | null;
  result: {
    bookingId: string;
    clientSecret: string;
    paymentIntentId: string;
  } | null;
};

type UseBookingSubmissionProps = {
  professionalId: string;
  services: ProfessionalService[];
  defaultHourlyRate: number | null;
  onSuccess?: () => void;
};

export function useBookingSubmission({
  professionalId,
  services,
  defaultHourlyRate,
  onSuccess,
}: UseBookingSubmissionProps) {
  const [submissionState, submitAction, isPending] = useActionState<SubmissionState, BookingData>(
    async (_prevState: SubmissionState, formData: BookingData): Promise<SubmissionState> => {
      try {
        const scheduledStart = new Date(
          `${formData.selectedDate?.toISOString().split("T")[0]}T${formData.selectedTime}:00`
        );
        const scheduledEnd = new Date(
          scheduledStart.getTime() + formData.durationHours * 60 * 60 * 1000
        );

        const selectedRate =
          formData.serviceHourlyRate ??
          services.find((s) => s.name === formData.serviceName)?.hourlyRateCop ??
          defaultHourlyRate ??
          0;
        const baseAmount =
          selectedRate && formData.durationHours > 0
            ? Math.round(selectedRate * formData.durationHours)
            : 0;
        const addonsTotal = formData.selectedAddons.reduce(
          (sum, addon) => sum + addon.price_cop,
          0
        );
        const totalAmount = baseAmount + addonsTotal;

        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            professionalId,
            serviceName: formData.serviceName,
            serviceHourlyRate: selectedRate,
            scheduledStart: scheduledStart.toISOString(),
            scheduledEnd: scheduledEnd.toISOString(),
            durationMinutes: formData.durationHours * 60,
            amount: totalAmount,
            specialInstructions: formData.specialInstructions || undefined,
            address: formData.address
              ? {
                  street: formData.address.street,
                  city: formData.address.city,
                  neighborhood: formData.address.neighborhood,
                  postal_code: formData.address.postal_code,
                  building_access: formData.address.building_access,
                  parking_info: formData.address.parking_info,
                  special_notes: formData.address.special_notes,
                }
              : formData.customAddress
                ? { raw: formData.customAddress }
                : undefined,
            selectedAddons:
              formData.selectedAddons.length > 0
                ? formData.selectedAddons.map((addon) => ({
                    addon_id: addon.id,
                    quantity: 1,
                  }))
                : undefined,
            isRecurring: formData.isRecurring,
            recurrencePattern: formData.recurrencePattern,
          }),
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? "Failed to create booking");
        }

        const result = await response.json();
        return { status: "success", error: null, result };
      } catch (err) {
        return {
          status: "error",
          error: err instanceof Error ? err.message : "Unexpected error",
          result: null,
        };
      }
    },
    { status: "idle", error: null, result: null }
  );

  // Call onSuccess callback when submission succeeds
  useEffect(() => {
    if (submissionState.status === "success" && onSuccess) {
      onSuccess();
    }
  }, [submissionState.status, onSuccess]);

  return {
    submissionState,
    submitAction,
    isPending,
  };
}
