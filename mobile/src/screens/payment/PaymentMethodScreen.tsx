import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { createPaymentIntent } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/format';
import type { CurrencyCode } from '@/types/territories';

type Props = MainTabScreenProps<'PaymentMethod'>;

export function PaymentMethodScreen({ route, navigation }: Props) {
  const { bookingId, amount_cents, currency_code } = route.params;
  const { confirmPayment } = useStripe();

  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const response = await createPaymentIntent({
        booking_id: bookingId,
        amount_cents,
        currency_code: currency_code as CurrencyCode,
        payment_method: 'stripe',
      });

      setClientSecret(response.client_secret);
      setPublishableKey(response.publishable_key);
    } catch (error) {
      console.error('Error initializing payment:', error);
      Alert.alert('Error', 'No se pudo inicializar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'No se pudo procesar el pago. Intenta nuevamente.');
      return;
    }

    setLoading(true);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        Alert.alert(
          'Error de Pago',
          error.message || 'No se pudo procesar el pago. Verifica tus datos.'
        );
      } else if (paymentIntent) {
        Alert.alert(
          '¡Pago Exitoso!',
          'Tu pago ha sido procesado exitosamente.',
          [
            {
              text: 'Ver Reserva',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'Bookings' },
                    { name: 'BookingDetail', params: { bookingId } },
                  ],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Método de Pago</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Display */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total a Pagar</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(amount_cents / 100, currency_code as CurrencyCode)}
          </Text>
        </Card>

        {/* Payment Method Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>

          {/* Stripe Card Input */}
          <View style={styles.paymentOption}>
            <View style={styles.paymentHeader}>
              <Ionicons name="card-outline" size={24} color={Colors.orange[500]} />
              <Text style={styles.paymentTitle}>Tarjeta de Crédito/Débito</Text>
            </View>

            {loading && !clientSecret ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.orange[500]} />
                <Text style={styles.loadingText}>Preparando pago...</Text>
              </View>
            ) : (
              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.cardField}
                style={styles.cardFieldContainer}
                onCardChange={(cardDetails) => {
                  setCardComplete(cardDetails.complete);
                }}
              />
            )}
          </View>

          {/* Future: PayPal Option */}
          <View style={[styles.paymentOption, styles.paymentOptionDisabled]}>
            <View style={styles.paymentHeader}>
              <Ionicons name="logo-paypal" size={24} color={Colors.neutral[400]} />
              <Text style={[styles.paymentTitle, styles.paymentTitleDisabled]}>
                PayPal
              </Text>
            </View>
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </View>
        </Card>

        {/* Security Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.green[500]} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Pago Seguro</Text>
            <Text style={styles.infoText}>
              Tu información está protegida con encriptación de nivel bancario.
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          title="Pagar Ahora"
          onPress={handlePayment}
          loading={loading}
          disabled={!cardComplete || !clientSecret}
          variant="primary"
          size="lg"
          style={styles.payButton}
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: Colors.orange[50],
    borderWidth: 1,
    borderColor: Colors.orange[200],
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.orange[600],
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
  paymentOption: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  paymentTitleDisabled: {
    color: Colors.text.secondary,
  },
  cardFieldContainer: {
    height: 50,
  },
  cardField: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    textColor: Colors.text.primary,
    placeholderColor: Colors.text.tertiary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  comingSoonText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.green[50],
    borderWidth: 1,
    borderColor: Colors.green[200],
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
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
  payButton: {
    width: '100%',
  },
});
