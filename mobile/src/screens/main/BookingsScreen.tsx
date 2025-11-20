import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getMyBookings } from '@/lib/api/bookings';
import type { Booking } from '@/types/api/booking';
import { formatDateTime, formatCurrency } from '@/lib/format';
import type { CurrencyCode } from '@/types/territories';

type Props = MainTabScreenProps<'Bookings'>;

export function BookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: Booking['status']) => {
    const colors = {
      pending: Colors.orange[500],
      confirmed: Colors.blue[500],
      in_progress: Colors.green[500],
      completed: Colors.neutral[500],
      cancelled: Colors.error,
    };
    return colors[status];
  };

  const getStatusLabel = (status: Booking['status']) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status];
  };

  const getStatusIcon = (status: Booking['status']) => {
    const icons: Record<Booking['status'], keyof typeof Ionicons.glyphMap> = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      in_progress: 'play-circle-outline',
      completed: 'checkmark-done-outline',
      cancelled: 'close-circle-outline',
    };
    return icons[status];
  };

  const activeBookings = bookings.filter(
    (b) => ['pending', 'confirmed', 'in_progress'].includes(b.status)
  );

  const pastBookings = bookings.filter(
    (b) => ['completed', 'cancelled'].includes(b.status)
  );

  const displayedBookings = activeTab === 'active' ? activeBookings : pastBookings;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Activas ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Pasadas ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedBookings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={Colors.neutral[300]}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No tienes reservas activas' : 'No tienes reservas pasadas'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? 'Cuando hagas una reserva, aparecerá aquí'
                : 'Tus reservas completadas o canceladas aparecerán aquí'}
            </Text>
          </Card>
        ) : (
          displayedBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const statusLabel = getStatusLabel(booking.status);
            const statusIcon = getStatusIcon(booking.status);

            return (
              <TouchableOpacity
                key={booking.id}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate('BookingDetail', { bookingId: booking.id });
                }}
              >
                <Card style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.serviceInfo}>
                      <Ionicons
                        name="construct-outline"
                        size={20}
                        color={Colors.orange[500]}
                      />
                      <Text style={styles.serviceType}>{booking.service_type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                      <Ionicons name={statusIcon} size={14} color={statusColor} />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingBody}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={Colors.neutral[500]}
                      />
                      <Text style={styles.detailText}>
                        {formatDateTime(new Date(booking.start_time), 'PPp', 'es')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={Colors.neutral[500]}
                      />
                      <Text style={styles.detailText}>
                        {booking.duration_hours} hora{booking.duration_hours > 1 ? 's' : ''}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={Colors.neutral[500]}
                      />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {booking.address.street}, {booking.address.city}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.price}>
                      {formatCurrency(
                        booking.total_amount_cents / 100,
                        booking.currency_code as CurrencyCode
                      )}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12, // Anthropic rounded-lg
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.orange[50],
    borderColor: Colors.orange[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.orange[600],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Anthropic rounded-lg
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingBody: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.orange[600],
  },
});
