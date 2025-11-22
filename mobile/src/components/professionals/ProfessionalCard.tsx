import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/Card";
import { Colors } from "@/constants/colors";
import { formatCurrency } from "@/lib/format";
import type { Professional } from "@/types/api/professional";
import type { CurrencyCode } from "@/types/territories";

interface ProfessionalCardProps {
  professional: Professional;
  onPress: () => void;
}

export function ProfessionalCard({ professional, onPress }: ProfessionalCardProps) {
  const getCurrencyCode = (countryCode: string): CurrencyCode => {
    const currencyMap: Record<string, CurrencyCode> = {
      CO: "COP",
      PY: "PYG",
      UY: "UYU",
      AR: "ARS",
    };
    return currencyMap[countryCode] || "COP";
  };

  const currencyCode = getCurrencyCode(professional.country_code);
  const hourlyRate = professional.hourly_rate_cents / 100;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {professional.profile_picture_url ? (
              <Image source={{ uri: professional.profile_picture_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons color={Colors.neutral[400]} name="person" size={32} />
              </View>
            )}
            {professional.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons color={Colors.blue[500]} name="checkmark-circle" size={20} />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.header}>
              <Text numberOfLines={1} style={styles.name}>
                {professional.full_name}
              </Text>
              {professional.rating && (
                <View style={styles.rating}>
                  <Ionicons color={Colors.orange[500]} name="star" size={14} />
                  <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Services */}
            {professional.services && professional.services.length > 0 && (
              <View style={styles.services}>
                {professional.services.slice(0, 2).map((service, index) => (
                  <View key={index} style={styles.serviceBadge}>
                    <Text numberOfLines={1} style={styles.serviceText}>
                      {service}
                    </Text>
                  </View>
                ))}
                {professional.services.length > 2 && (
                  <Text style={styles.moreServices}>+{professional.services.length - 2}</Text>
                )}
              </View>
            )}

            {/* Bio */}
            {professional.bio && (
              <Text numberOfLines={2} style={styles.bio}>
                {professional.bio}
              </Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.experience}>
                <Ionicons color={Colors.neutral[500]} name="briefcase-outline" size={14} />
                <Text style={styles.experienceText}>{professional.years_of_experience} años</Text>
              </View>
              <Text style={styles.price}>{formatCurrency(hourlyRate, currencyCode)}/hora</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36, // rounded-full
    backgroundColor: Colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36, // rounded-full
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.orange[50],
    borderRadius: 12, // Anthropic rounded-lg
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.orange[600],
  },
  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.neutral[100],
    borderRadius: 12, // Anthropic rounded-lg
    maxWidth: 120,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  moreServices: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.tertiary,
  },
  bio: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  experience: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.orange[600],
  },
});
