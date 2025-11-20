import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getProfessionalById } from '@/lib/api/professionals';
import { createBooking } from '@/lib/api/bookings';
import type { Professional } from '@/types/api/professional';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { CurrencyCode } from '@/types/territories';

type Props = MainTabScreenProps<'BookingConfirm'>;

export function BookingConfirmScreen({ route, navigation }: Props) {
  const { professionalId, serviceType, durationHours, startTime, address } = route.params;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfessional();
  }, []);

  const loadProfessional = async () => {
    try {
      const data = await getProfessionalById(professionalId);
      setProfessional(data);
    } catch (error) {
      console.error('Error loading professional:', error);
      Alert.alert('Error', 'No se pudo cargar la información del profesional');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyCode = (countryCode: string): CurrencyCode => {
    const currencyMap: Record<string, CurrencyCode> = {
      CO: 'COP',
      PY: 'PYG',
      UY: 'UYU',
      AR: 'ARS',
    };
    return currencyMap[countryCode] || 'COP';
  };

  const handleConfirmBooking = async () => {
    if (!professional) return;

    setSubmitting(true);
    try {
      const booking = await createBooking({
        professional_id: professionalId,
        service_type: serviceType,
        booking_type: 'marketplace',
        start_time: startTime,
        duration_hours: durationHours,
        address,
      });

      // Navigate to payment screen with booking details
      navigation.navigate('PaymentMethod', {
        bookingId: booking.id,
        amount_cents: Math.round(totalAmount * 100),
        currency_code: currencyCode,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'No se pudo crear la reserva. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar los datos</Text>
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const currencyCode = getCurrencyCode(professional.country_code);
  const hourlyRate = professional.hourly_rate_cents / 100;
  const totalAmount = hourlyRate * durationHours;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Reserva</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Professional Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profesional</Text>
          <View style={styles.professionalRow}>
            {professional.profile_picture_url ? (
              <Image
                source={{ uri: professional.profile_picture_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={Colors.neutral[400]} />
              </View>
            )}
            <View style={styles.professionalInfo}>
              <View style={styles.professionalNameRow}>
                <Text style={styles.professionalName}>{professional.full_name}</Text>
                {professional.verified && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.blue[500]} />
                )}
              </View>
              {professional.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={Colors.orange[500]} />
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
              <Ionicons name="construct-outline" size={20} color={Colors.orange[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Servicio</Text>
              <Text style={styles.detailValue}>{serviceType}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={Colors.orange[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha y Hora</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(new Date(startTime), 'PPp', 'es')}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="hourglass-outline" size={20} color={Colors.orange[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duración</Text>
              <Text style={styles.detailValue}>{durationHours} hora{durationHours > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="location-outline" size={20} color={Colors.orange[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailValue}>{address.street}</Text>
              <Text style={styles.detailLabel}>
                {address.neighborhood && `${address.neighborhood}, `}
                {address.city}
              </Text>
              {address.notes && (
                <Text style={styles.addressNotes}>{address.notes}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Price Summary */}
        <Card style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Resumen de Precio</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {formatCurrency(hourlyRate, currencyCode)}/hora × {durationHours}h
            </Text>
            <Text style={styles.priceValue}>
              {formatCurrency(totalAmount, currencyCode)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimado</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalAmount, currencyCode)}
            </Text>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.blue[500]} />
          </View>
          <Text style={styles.infoText}>
            El precio final puede variar según la complejidad del trabajo. El profesional te confirmará el costo exacto.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>
            {formatCurrency(totalAmount, currencyCode)}
          </Text>
        </View>
        <Button
          title="Confirmar Reserva"
          onPress={handleConfirmBooking}
          loading={submitting}
          variant="primary"
          size="lg"
          style={styles.confirmButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  professionalRow: {
    flexDirection: 'row',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  professionalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  professionalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20, // rounded-full
    backgroundColor: Colors.orange[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  addressNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  priceCard: {
    marginBottom: 16,
    backgroundColor: Colors.orange[50],
    borderWidth: 1,
    borderColor: Colors.orange[200],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.orange[200],
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.orange[600],
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.blue[50],
    borderWidth: 1,
    borderColor: Colors.blue[200],
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  bottomTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.orange[600],
  },
  confirmButton: {
    width: '100%',
  },
});
