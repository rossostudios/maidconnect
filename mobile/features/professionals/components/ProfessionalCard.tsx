import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { computeAvailableToday, formatLocation } from '../transformers';
import type { ProfessionalProfile } from '../types';

type ProfessionalCardProps = {
  professional: ProfessionalProfile;
  onPress?: (profileId: string) => void;
};

const ProfessionalCardComponent = ({ professional, onPress }: ProfessionalCardProps) => {
  const availabilityLabel = useMemo(() => {
    if (computeAvailableToday(professional.availability)) {
      return 'Available today';
    }
    if (professional.availability.length > 0) {
      return `Next availability: ${professional.availability[0]?.day ?? 'Scheduled'}`;
    }
    return 'Availability on request';
  }, [professional.availability]);

  const serviceLabel =
    professional.primaryServices[0] ??
    professional.services[0]?.name ??
    'Professional home services';

  const handlePress = () => {
    onPress?.(professional.profileId);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.name}>{professional.fullName ?? 'Anonymous Professional'}</Text>
        {professional.verificationLevel === 'verified' ? (
          <View style={styles.badge}>
            <IconSymbol name="checkmark.seal.fill" size={16} color="#1D4ED8" />
            <Text style={styles.badgeLabel}>Verified</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.service}>{serviceLabel}</Text>
      <View style={styles.metaRow}>
        <IconSymbol name="mappin.and.ellipse" size={18} color="#475569" />
        <Text style={styles.metaText}>{formatLocation(professional.city, professional.country)}</Text>
      </View>
      <View style={styles.metaRow}>
        <IconSymbol name="clock" size={18} color="#475569" />
        <Text style={styles.metaText}>{availabilityLabel}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat value={professional.rating?.toFixed(1) ?? '—'} label="Rating" />
        <Stat value={`${professional.reviewCount}`} label="Reviews" />
        <Stat value={`${professional.totalCompletedBookings}`} label="Completed" />
      </View>

      <View style={styles.statsRow}>
        <Stat value={`${professional.onTimeRate ?? 0}%`} label="On-time" />
        <Stat value={`${professional.acceptanceRate ?? 0}%`} label="Acceptance" />
        {professional.distanceKm != null ? (
          <Stat value={`${professional.distanceKm.toFixed(1)} km`} label="Away" />
        ) : (
          <Stat value="—" label="Distance" />
        )}
      </View>
    </Pressable>
  );
};

type StatProps = {
  value: string;
  label: string;
};

const Stat = ({ value, label }: StatProps) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const ProfessionalCard = memo(ProfessionalCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    textTransform: 'uppercase',
  },
  service: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
