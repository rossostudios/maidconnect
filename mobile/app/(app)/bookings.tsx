import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fetchBookings, summarizeStatuses } from '@/features/bookings/api';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import type { Booking, BookingStatusSummary } from '@/features/bookings/types';

const EMPTY_BOOKINGS: Booking[] = [];

export default function BookingsScreen() {
  const { data, error, isLoading, isRefetching, refetch } = useQuery<Booking[], Error>({
    queryKey: ['bookings', { limit: 30 }],
    queryFn: () => fetchBookings(30),
    placeholderData: (previous) => previous,
  });

  const bookings = data ?? EMPTY_BOOKINGS;
  const summaries = useMemo<BookingStatusSummary[]>(() => summarizeStatuses(bookings), [bookings]);
  const errorMessage = error ? 'Unable to load bookings. Pull to refresh to retry.' : null;

  const renderItem = ({ item }: { item: Booking }) => <BookingCard booking={item} />;
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={bookings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyDescription}>
                When customers confirm appointments, you will see the full itinerary here.
              </Text>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function humanizeStatus(status: string) {
  switch (status) {
    case 'pending_payment':
      return 'Pending';
    case 'authorized':
      return 'Authorized';
    case 'confirmed':
      return 'Confirmed';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'declined':
      return 'Declined';
    case 'canceled':
      return 'Canceled';
    default:
      return status.replace(/_/g, ' ');
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
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
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderRadius: 16,
    minWidth: 110,
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#CBD5F5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
