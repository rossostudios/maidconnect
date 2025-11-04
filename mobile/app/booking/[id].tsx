import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RescheduleModal } from "@/components/bookings/reschedule-modal";
import { ReviewForm } from "@/components/reviews/review-form";
import { cancelBooking, extendBooking, rescheduleBooking } from "@/features/bookings/actions";
import type { Booking } from "@/features/bookings/types";
import { useRealtimeBooking } from "@/features/bookings/use-realtime-booking";
import { createConversation } from "@/features/messaging/api";
import { createReview, hasReviewedBooking } from "@/features/reviews/api";
import { supabase } from "@/lib/supabase";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showActions, setShowActions] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Subscribe to realtime booking updates
  useRealtimeBooking(id || null);

  // Check if user has already reviewed this booking
  const { data: hasReviewed } = useQuery({
    queryKey: ["hasReviewed", id],
    queryFn: () => hasReviewedBooking(id!),
    enabled: !!id,
  });

  const {
    data: booking,
    error,
    isLoading,
  } = useQuery<Booking, Error>({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          status,
          scheduled_start,
          scheduled_end,
          duration_minutes,
          amount_estimated,
          addons_total_amount,
          currency,
          special_instructions,
          professional_id,
          customer_id,
          address,
          professional:professional_profiles!bookings_professional_id_fkey (
            profile_id,
            full_name,
            phone_number
          ),
          customer:profiles!bookings_customer_id_fkey (
            id,
            full_name,
            phone_number
          )
        `
        )
        .eq("id", id!)
        .single();

      if (fetchError) {
        throw fetchError;
      }
      if (!data) {
        throw new Error("Booking not found");
      }

      return {
        id: data.id,
        status: data.status,
        startsAt: data.scheduled_start ? new Date(data.scheduled_start) : null,
        endsAt: data.scheduled_end ? new Date(data.scheduled_end) : null,
        durationMinutes: data.duration_minutes,
        totalAmount: (data.amount_estimated ?? 0) + (data.addons_total_amount ?? 0),
        currency: data.currency ?? "cop",
        professionalName: (data.professional as any)?.full_name || "Professional",
        customerName: (data.customer as any)?.full_name || "Customer",
        addressSummary: formatAddress(data.address),
        specialInstructions: data.special_instructions,
      } as Booking & { specialInstructions?: string };
    },
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking({ bookingId: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      Alert.alert("Success", "Booking cancelled successfully");
      router.back();
    },
    onError: (cancelError: Error) => {
      Alert.alert("Error", cancelError.message || "Failed to cancel booking");
    },
  });

  const extendMutation = useMutation({
    mutationFn: (additionalHours: number) => extendBooking({ bookingId: id!, additionalHours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      Alert.alert("Success", "Booking extended successfully");
    },
    onError: (extendError: Error) => {
      Alert.alert("Error", extendError.message || "Failed to extend booking");
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ newDate, newTime }: { newDate: string; newTime: string }) =>
      rescheduleBooking({ bookingId: id!, newDate, newTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      Alert.alert("Success", "Booking rescheduled successfully");
    },
    onError: (rescheduleError: Error) => {
      Alert.alert("Error", rescheduleError.message || "Failed to reschedule booking");
    },
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (newDate: string, newTime: string) => {
    await rescheduleMutation.mutateAsync({ newDate, newTime });
  };

  const handleExtend = () => {
    Alert.alert("Extend Booking", "How many additional hours?", [
      { text: "Cancel", style: "cancel" },
      { text: "1 hour", onPress: () => extendMutation.mutate(1) },
      { text: "2 hours", onPress: () => extendMutation.mutate(2) },
      { text: "3 hours", onPress: () => extendMutation.mutate(3) },
    ]);
  };

  const handleMessage = async () => {
    if (!booking) {
      return;
    }

    try {
      // Get professional ID from booking data
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("professional_id, customer_id")
        .eq("id", id!)
        .single();

      if (!bookingData) {
        Alert.alert("Error", "Unable to start conversation");
        return;
      }

      // Check if conversation already exists for this booking
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("booking_id", id!)
        .maybeSingle();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        conversationId = await createConversation({
          bookingId: id!,
          otherUserId: bookingData.professional_id,
        });
      }

      // Navigate to conversation
      router.push(`/messages/${conversationId}`);
    } catch (messageError) {
      console.error("Failed to start conversation:", messageError);
      Alert.alert("Error", "Unable to start conversation. Please try again.");
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    await createReview({
      bookingId: id!,
      rating,
      comment: comment || undefined,
    });

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["hasReviewed", id] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });

    Alert.alert("Success", "Thank you for your review!");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading booking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons color="#DC2626" name="alert-circle-outline" size={48} />
          <Text style={styles.errorTitle}>Unable to load booking</Text>
          <Text style={styles.errorMessage}>{error?.message || "Booking not found"}</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = ["pending_payment", "authorized", "confirmed"].includes(booking.status);
  const canReschedule = ["confirmed"].includes(booking.status);
  const canExtend = ["in_progress"].includes(booking.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backIconButton}>
            <Ionicons color="#0F172A" name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Pressable onPress={() => setShowActions(!showActions)} style={styles.moreButton}>
            <Ionicons color="#0F172A" name="ellipsis-vertical" size={24} />
          </Pressable>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle(booking.status)]}>
            <Text style={styles.statusText}>{formatStatus(booking.status)}</Text>
          </View>
        </View>

        {/* Booking Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>

          <InfoRow
            icon="calendar-outline"
            label="Date"
            value={
              booking.startsAt
                ? booking.startsAt.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not specified"
            }
          />

          <InfoRow
            icon="time-outline"
            label="Time"
            value={
              booking.startsAt
                ? booking.startsAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not specified"
            }
          />

          <InfoRow
            icon="hourglass-outline"
            label="Duration"
            value={
              booking.durationMinutes
                ? `${Math.floor(booking.durationMinutes / 60)} hours`
                : "Not specified"
            }
          />

          <InfoRow
            icon="cash-outline"
            label="Total Amount"
            value={`$${booking.totalAmount?.toLocaleString() || 0} COP`}
          />
        </View>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional</Text>
          <InfoRow icon="person-outline" label="Name" value={booking.professionalName || "—"} />
          <Pressable onPress={handleMessage} style={styles.contactButton}>
            <Ionicons color="#2563EB" name="chatbubble-outline" size={20} />
            <Text style={styles.contactButtonText}>Message Professional</Text>
          </Pressable>
        </View>

        {/* Address */}
        {booking.addressSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Location</Text>
            <InfoRow icon="location-outline" label="Address" value={booking.addressSummary} />
          </View>
        )}

        {/* Special Instructions */}
        {(booking as any).specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructionsText}>{(booking as any).specialInstructions}</Text>
          </View>
        )}

        {/* Rate Service Button - Show for completed bookings that haven't been reviewed */}
        {booking.status === "completed" && !hasReviewed && (
          <View style={styles.rateServiceContainer}>
            <Pressable onPress={() => setShowReviewForm(true)} style={styles.rateServiceButton}>
              <Ionicons color="#F59E0B" name="star" size={24} />
              <Text style={styles.rateServiceText}>Rate This Service</Text>
            </Pressable>
            <Text style={styles.rateServiceSubtext}>Share your experience to help others</Text>
          </View>
        )}

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionsContainer}>
            {canExtend && (
              <Pressable
                disabled={extendMutation.isPending}
                onPress={handleExtend}
                style={styles.actionButton}
              >
                <Ionicons color="#10B981" name="add-circle-outline" size={20} />
                <Text style={[styles.actionButtonText, { color: "#10B981" }]}>Extend Time</Text>
              </Pressable>
            )}

            {canReschedule && (
              <Pressable onPress={handleReschedule} style={styles.actionButton}>
                <Ionicons color="#2563EB" name="calendar-outline" size={20} />
                <Text style={[styles.actionButtonText, { color: "#2563EB" }]}>Reschedule</Text>
              </Pressable>
            )}

            {canCancel && (
              <Pressable
                disabled={cancelMutation.isPending}
                onPress={handleCancel}
                style={styles.actionButton}
              >
                <Ionicons color="#DC2626" name="close-circle-outline" size={20} />
                <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Cancel Booking</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* Review Form Modal */}
      <ReviewForm
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleReviewSubmit}
        professionalName={booking.professionalName || "the professional"}
        visible={showReviewForm}
      />

      {/* Reschedule Modal */}
      {booking?.startsAt && (
        <RescheduleModal
          currentDate={booking.startsAt}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleRescheduleSubmit}
          visible={showRescheduleModal}
        />
      )}
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <Ionicons color="#64748B" name={icon as any} size={20} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatAddress(address: any): string | null {
  if (!address) {
    return null;
  }
  const parts: string[] = [];
  if (address.street_address) {
    parts.push(address.street_address);
  }
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  if (address.city) {
    parts.push(address.city);
  }
  return parts.join(", ") || null;
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return { backgroundColor: "#DBEAFE", borderColor: "#2563EB" };
    case "in_progress":
      return { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" };
    case "completed":
      return { backgroundColor: "#D1FAE5", borderColor: "#10B981" };
    case "canceled":
    case "declined":
      return { backgroundColor: "#FEE2E2", borderColor: "#DC2626" };
    default:
      return { backgroundColor: "#F1F5F9", borderColor: "#64748B" };
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  statusContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    marginTop: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  rateServiceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rateServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  rateServiceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400E",
  },
  rateServiceSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
