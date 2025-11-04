import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { computeAvailableToday, formatLocation } from "../transformers";
import type { ProfessionalProfile, ProfessionalSummary } from "../types";

type ProfessionalCardProps = {
  professional: ProfessionalProfile | ProfessionalSummary;
  onPress?: (profileId: string) => void;
};

const ProfessionalCardComponent = ({ professional, onPress }: ProfessionalCardProps) => {
  const availability = "availability" in professional ? professional.availability : [];
  const availabilityLabel = useMemo(() => {
    if (computeAvailableToday(availability)) {
      return "Available today";
    }
    if (availability.length > 0) {
      return `Next availability: ${availability[0]?.day ?? "Scheduled"}`;
    }
    return "Availability on request";
  }, [availability]);

  const primaryServices = "primaryServices" in professional ? professional.primaryServices : [];
  const serviceLabel =
    primaryServices[0] ?? professional.services[0]?.name ?? "Professional home services";

  const handlePress = () => {
    onPress?.(professional.profileId);
  };

  const verificationLevel =
    "verificationLevel" in professional ? professional.verificationLevel : null;
  const city = "city" in professional ? professional.city : null;
  const country = "country" in professional ? professional.country : null;
  const acceptanceRate = "acceptanceRate" in professional ? professional.acceptanceRate : null;
  const distanceKm = "distanceKm" in professional ? professional.distanceKm : null;

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{professional.fullName ?? "Anonymous Professional"}</Text>
        {verificationLevel === "verified" ? (
          <View style={styles.badge}>
            <IconSymbol color="#1D4ED8" name="checkmark.seal.fill" size={16} />
            <Text style={styles.badgeLabel}>Verified</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.service}>{serviceLabel}</Text>
      {(city || country) && (
        <View style={styles.metaRow}>
          <IconSymbol color="#475569" name="mappin.and.ellipse" size={18} />
          <Text style={styles.metaText}>{formatLocation(city, country)}</Text>
        </View>
      )}
      <View style={styles.metaRow}>
        <IconSymbol color="#475569" name="clock" size={18} />
        <Text style={styles.metaText}>{availabilityLabel}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat label="Rating" value={professional.rating?.toFixed(1) ?? "—"} />
        <Stat label="Reviews" value={`${professional.reviewCount}`} />
        <Stat label="Completed" value={`${professional.totalCompletedBookings}`} />
      </View>

      <View style={styles.statsRow}>
        <Stat label="On-time" value={`${professional.onTimeRate ?? 0}%`} />
        <Stat label="Acceptance" value={`${acceptanceRate ?? 0}%`} />
        {distanceKm != null ? (
          <Stat label="Away" value={`${distanceKm.toFixed(1)} km`} />
        ) : (
          <Stat label="Distance" value="—" />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
    textTransform: "uppercase",
  },
  service: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
