import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchBookings, summarizeStatuses } from "@/features/bookings/api";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import type { Booking, BookingStatusSummary } from "@/features/bookings/types";

const EMPTY_BOOKINGS: Booking[] = [];

const STATUS_FILTERS = [
  { label: "All", value: null },
  { label: "Pending", value: "pending_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Canceled", value: "canceled" },
] as const;

export default function BookingsScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data, error, isLoading, isRefetching, refetch } = useQuery<Booking[], Error>({
    queryKey: ["bookings", { limit: 30 }],
    queryFn: () => fetchBookings(30),
    placeholderData: (previous) => previous,
  });

  const bookings = data ?? EMPTY_BOOKINGS;
  const summaries = useMemo<BookingStatusSummary[]>(() => summarizeStatuses(bookings), [bookings]);
  const errorMessage = error ? "Unable to load bookings. Pull to refresh to retry." : null;

  // Filter bookings by selected status
  const filteredBookings = useMemo(() => {
    if (!selectedStatus) {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === selectedStatus);
  }, [bookings, selectedStatus]);

  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <BookingCard booking={item} onPress={handleBookingPress} />
  );
  const keyExtractor = (item: Booking) => item.id;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.subtitle}>
        Monitor upcoming appointments, payment status, and fulfillment metrics wherever you are.
      </Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.summaryRow}>
        {summaries.length === 0 ? (
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        ) : (
          summaries.map((summary) => (
            <View key={summary.status} style={styles.summaryPill}>
              <Text style={styles.summaryValue}>{summary.count}</Text>
              <Text style={styles.summaryLabel}>{humanizeStatus(summary.status)}</Text>
            </View>
          ))
        )}
      </View>

      {/* Status Filter Chips */}
      <View>
        <Text style={styles.filterLabel}>Filter by status:</Text>
        <ScrollView
          contentContainerStyle={styles.filterChips}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter.label}
              onPress={() => setSelectedStatus(filter.value)}
              style={[
                styles.filterChip,
                selectedStatus === filter.value && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
        {selectedStatus
          ? ` (${STATUS_FILTERS.find((f) => f.value === selectedStatus)?.label})`
          : ""}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredBookings}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              action={
                selectedStatus
                  ? {
                      label: "Clear Filter",
                      onPress: () => setSelectedStatus(null),
                      variant: "outline",
                    }
                  : undefined
              }
              description={
                selectedStatus
                  ? "Try selecting a different status filter"
                  : "When customers confirm appointments, you will see the full itinerary here."
              }
              icon="calendar-outline"
              title={selectedStatus ? "No matching bookings" : "No bookings yet"}
            />
          )
        }
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        renderItem={renderItem}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#22C55E" size="large" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function humanizeStatus(status: string) {
  switch (status) {
    case "pending_payment":
      return "Pending";
    case "authorized":
      return "Authorized";
    case "confirmed":
      return "Confirmed";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "declined":
      return "Declined";
    case "canceled":
      return "Canceled";
    default:
      return status.replace(/_/g, " ");
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#475569",
  },
  error: {
    fontSize: 14,
    color: "#DC2626",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderRadius: 16,
    minWidth: 110,
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#CBD5F5",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
  },
  clearFilterButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  filterChips: {
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
