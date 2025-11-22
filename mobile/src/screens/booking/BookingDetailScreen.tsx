import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { cancelBooking, getBookingById } from "@/lib/api/bookings";
import { getProfessionalById } from "@/lib/api/professionals";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking } from "@/types/api/booking";
import type { Professional } from "@/types/api/professional";
import type { MainTabScreenProps } from "@/types/navigation";
import type { CurrencyCode } from "@/types/territories";

type Props = MainTabScreenProps<"BookingDetail">;

export function BookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData);

      if (bookingData) {
        const professionalData = await getProfessionalById(bookingData.professional_id);
        setProfessional(professionalData);
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      Alert.alert("Error", "No se pudo cargar la información de la reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancelar Reserva",
      "¿Estás seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelBooking(bookingId);
              Alert.alert("Reserva Cancelada", "La reserva ha sido cancelada exitosamente.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "No se pudo cancelar la reserva. Intenta nuevamente.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Booking["status"]) => {
    const colors = {
      pending: Colors.orange[500],
      confirmed: Colors.blue[500],
      in_progress: Colors.green[500],
      completed: Colors.neutral[500],
      cancelled: Colors.error,
    };
    return colors[status];
  };

  const getStatusLabel = (status: Booking["status"]) => {
    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      in_progress: "En Progreso",
      completed: "Completada",
      cancelled: "Cancelada",
    };
    return labels[status];
  };

  const getStatusIcon = (status: Booking["status"]) => {
    const icons: Record<Booking["status"], keyof typeof Ionicons.glyphMap> = {
      pending: "time-outline",
      confirmed: "checkmark-circle-outline",
      in_progress: "play-circle-outline",
      completed: "checkmark-done-outline",
      cancelled: "close-circle-outline",
    };
    return icons[status];
  };

  const canCancelBooking = booking && ["pending", "confirmed"].includes(booking.status);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.orange[500]} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!(booking && professional)) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la reserva</Text>
          <Button onPress={() => navigation.goBack()} title="Volver" />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);
  const statusIcon = getStatusIcon(booking.status);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={Colors.text.primary} name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Reserva</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: `${statusColor}15` }]}>
          <View style={styles.statusContent}>
            <Ionicons color={statusColor} name={statusIcon} size={48} />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Estado de la Reserva</Text>
              <Text style={[styles.statusValue, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Professional Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profesional</Text>
          <View style={styles.professionalRow}>
            {professional.profile_picture_url ? (
              <Image source={{ uri: professional.profile_picture_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons color={Colors.neutral[400]} name="person" size={32} />
              </View>
            )}
            <View style={styles.professionalInfo}>
              <View style={styles.professionalNameRow}>
                <Text style={styles.professionalName}>{professional.full_name}</Text>
                {professional.verified && (
                  <Ionicons color={Colors.blue[500]} name="checkmark-circle" size={18} />
                )}
              </View>
              {professional.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons color={Colors.orange[500]} name="star" size={14} />
                  <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Service Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Servicio</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons color={Colors.orange[500]} name="construct-outline" size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Servicio</Text>
              <Text style={styles.detailValue}>{booking.service_type}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons color={Colors.orange[500]} name="time-outline" size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha y Hora</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(new Date(booking.start_time), "PPp", "es")}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons color={Colors.orange[500]} name="hourglass-outline" size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duración</Text>
              <Text style={styles.detailValue}>
                {booking.duration_hours} hora{booking.duration_hours > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons color={Colors.orange[500]} name="location-outline" size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailValue}>{booking.address.street}</Text>
              <Text style={styles.detailLabel}>
                {booking.address.neighborhood && `${booking.address.neighborhood}, `}
                {booking.address.city}
              </Text>
              {booking.address.notes && (
                <Text style={styles.addressNotes}>{booking.address.notes}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Special Instructions */}
        {booking.special_instructions && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Instrucciones Especiales</Text>
            <Text style={styles.instructionsText}>{booking.special_instructions}</Text>
          </Card>
        )}

        {/* Price */}
        <Card style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Total</Text>
          <Text style={styles.totalPrice}>
            {formatCurrency(
              booking.total_amount_cents / 100,
              booking.currency_code as CurrencyCode
            )}
          </Text>
        </Card>

        {/* Cancel Button */}
        {canCancelBooking && (
          <Button
            loading={cancelling}
            onPress={handleCancelBooking}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            title="Cancelar Reserva"
            variant="outline"
          />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerRight: {
    width: 40,
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statusCard: {
    borderRadius: 12, // Anthropic rounded-lg
    padding: 20,
    marginBottom: 16,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  professionalRow: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28, // rounded-full
    backgroundColor: Colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28, // rounded-full
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  professionalInfo: {
    flex: 1,
    justifyContent: "center",
  },
  professionalNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20, // rounded-full
    backgroundColor: Colors.orange[50],
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  addressNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  priceCard: {
    marginBottom: 16,
    backgroundColor: Colors.orange[50],
    borderWidth: 1,
    borderColor: Colors.orange[200],
  },
  totalPrice: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.orange[600],
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  cancelButtonText: {
    color: Colors.error,
  },
});
