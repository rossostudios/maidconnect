import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Colors } from "@/constants/colors";
import { getProfessionalById } from "@/lib/api/professionals";
import { formatCurrency } from "@/lib/format";
import type { Professional } from "@/types/api/professional";
import type { MainTabScreenProps } from "@/types/navigation";
import type { CurrencyCode } from "@/types/territories";

type Props = MainTabScreenProps<"ProfessionalDetail">;

export function ProfessionalDetailScreen({ route, navigation }: Props) {
  const { professionalId } = route.params;
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      setLoading(true);
      const data = await getProfessionalById(professionalId);
      setProfessional(data);
    } catch (error) {
      console.error("Error loading professional:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyCode = (countryCode: string): CurrencyCode => {
    const currencyMap: Record<string, CurrencyCode> = {
      CO: "COP",
      PY: "PYG",
      UY: "UYU",
      AR: "ARS",
    };
    return currencyMap[countryCode] || "COP";
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.orange[500]} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el profesional</Text>
          <Button onPress={() => navigation.goBack()} title="Volver" />
        </View>
      </SafeAreaView>
    );
  }

  const currencyCode = getCurrencyCode(professional.country_code);
  const hourlyRate = professional.hourly_rate_cents / 100;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons color={Colors.text.primary} name="arrow-back" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {professional.profile_picture_url ? (
            <Image source={{ uri: professional.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons color={Colors.neutral[400]} name="person" size={64} />
            </View>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{professional.full_name}</Text>
              {professional.verified && (
                <Ionicons color={Colors.blue[500]} name="checkmark-circle" size={24} />
              )}
            </View>

            {professional.rating && (
              <View style={styles.ratingRow}>
                <Ionicons color={Colors.orange[500]} name="star" size={18} />
                <Text style={styles.ratingValue}>{professional.rating.toFixed(1)}</Text>
                {professional.review_count && (
                  <Text style={styles.reviewCount}>({professional.review_count} reseñas)</Text>
                )}
              </View>
            )}

            <View style={styles.locationRow}>
              <Ionicons color={Colors.neutral[500]} name="location-outline" size={16} />
              <Text style={styles.locationText}>{professional.city}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Ionicons color={Colors.orange[500]} name="briefcase-outline" size={24} />
            <Text style={styles.statValue}>{professional.years_of_experience}</Text>
            <Text style={styles.statLabel}>Años de experiencia</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons color={Colors.orange[500]} name="cash-outline" size={24} />
            <Text style={styles.statValue}>{formatCurrency(hourlyRate, currencyCode)}</Text>
            <Text style={styles.statLabel}>Por hora</Text>
          </Card>
        </View>

        {/* Services */}
        {professional.services && professional.services.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <View style={styles.servicesContainer}>
              {professional.services.map((service, index) => (
                <View key={index} style={styles.serviceBadge}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Bio */}
        {professional.bio && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{professional.bio}</Text>
          </Card>
        )}

        {/* Background Check Status */}
        {professional.background_check_status && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Verificación</Text>
            <View style={styles.verificationRow}>
              <Ionicons
                color={
                  professional.background_check_status === "approved"
                    ? Colors.green[500]
                    : Colors.neutral[500]
                }
                name={
                  professional.background_check_status === "approved"
                    ? "shield-checkmark"
                    : "shield-outline"
                }
                size={20}
              />
              <Text style={styles.verificationText}>
                {professional.background_check_status === "approved"
                  ? "Verificación de antecedentes aprobada"
                  : professional.background_check_status === "pending"
                    ? "Verificación en proceso"
                    : "Sin verificación"}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio por hora</Text>
          <Text style={styles.price}>{formatCurrency(hourlyRate, currencyCode)}</Text>
        </View>
        <Button
          onPress={() => {
            navigation.navigate("BookingService", { professionalId: professional.id });
          }}
          style={styles.bookButton}
          title="Reservar"
          variant="primary"
        />
      </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  profileSection: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60, // rounded-full
    backgroundColor: Colors.neutral[200],
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60, // rounded-full
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: "center",
    gap: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.orange[50],
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 1,
    borderColor: Colors.orange[200],
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.orange[600],
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  verificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verificationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.orange[600],
  },
  bookButton: {
    flex: 1,
  },
});
