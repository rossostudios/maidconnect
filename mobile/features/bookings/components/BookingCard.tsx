import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import type { Booking } from '../types';

type BookingCardProps = {
  booking: Booking;
};

const STATUS_COPY: Record<string, string> = {
  pending_payment: 'Pending payment',
  authorized: 'Authorized',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
  canceled: 'Canceled',
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: '#F97316',
  authorized: '#3B82F6',
  confirmed: '#2563EB',
  in_progress: '#0EA5E9',
  completed: '#16A34A',
  declined: '#DC2626',
  canceled: '#9CA3AF',
};

function formatCurrency(value: number | null, currency: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalizedCurrency = currency?.toUpperCase() ?? 'COP';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(value / 100);
  } catch {
    return `${(value / 100).toFixed(0)} ${normalizedCurrency}`;
  }
}

function formatDateRange(startsAt: Date | null, endsAt: Date | null): string {
  if (!startsAt) {
    return 'Unscheduled';
  }

  const startFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  const start = startFormatter.format(startsAt);

  if (!endsAt) {
    return start;
  }

  const endFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });

  return `${start} - ${endFormatter.format(endsAt)}`;
}

const BookingCardComponent = ({ booking }: BookingCardProps) => {
  const totalAmountLabel = formatCurrency(booking.totalAmount, booking.currency);

  const statusStyles = useMemo(() => {
    const color = STATUS_COLOR[booking.status] ?? '#3B82F6';
    return {
      backgroundColor: `${color}1A`,
      borderColor: `${color}33`,
      textColor: color,
    };
  }, [booking.status]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>#{booking.id.slice(0, 8).toUpperCase()}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyles.backgroundColor, borderColor: statusStyles.borderColor },
          ]}>
          <Text style={[styles.statusLabel, { color: statusStyles.textColor }]}>
            {STATUS_COPY[booking.status] ?? booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <IconSymbol name="calendar" size={18} color="#1E293B" />
        <Text style={styles.rowText}>{formatDateRange(booking.startsAt, booking.endsAt)}</Text>
      </View>

      {booking.professionalName ? (
        <View style={styles.row}>
          <IconSymbol name="person.crop.circle.badge.checkmark" size={18} color="#1E293B" />
          <Text style={styles.rowText}>{booking.professionalName}</Text>
        </View>
      ) : null}

      {booking.customerName ? (
        <View style={styles.row}>
          <IconSymbol name="person.crop.circle" size={18} color="#1E293B" />
          <Text style={styles.rowText}>{booking.customerName}</Text>
        </View>
      ) : null}

      {booking.addressSummary ? (
        <View style={styles.row}>
          <IconSymbol name="mappin.circle" size={18} color="#1E293B" />
          <Text style={styles.rowText}>{booking.addressSummary}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        {booking.durationMinutes ? (
          <View style={styles.footerPill}>
            <IconSymbol name="clock" size={16} color="#1E3A8A" />
            <Text style={styles.footerPillText}>{booking.durationMinutes} min</Text>
          </View>
        ) : null}

        {totalAmountLabel ? (
          <View style={styles.footerPill}>
            <IconSymbol name="creditcard" size={16} color="#1E3A8A" />
            <Text style={styles.footerPillText}>{totalAmountLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const BookingCard = memo(BookingCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0E7FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  footerPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});
