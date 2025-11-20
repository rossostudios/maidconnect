import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type Props = MainTabScreenProps<'BookingService'>;

export function BookingServiceScreen({ route, navigation }: Props) {
  const { professionalId } = route.params;
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(2);

  const services = [
    { id: 'cleaning', name: 'Limpieza', icon: 'sparkles-outline' as const },
    { id: 'plumbing', name: 'Plomería', icon: 'water-outline' as const },
    { id: 'electrical', name: 'Electricidad', icon: 'flash-outline' as const },
    { id: 'gardening', name: 'Jardinería', icon: 'leaf-outline' as const },
    { id: 'painting', name: 'Pintura', icon: 'brush-outline' as const },
    { id: 'carpentry', name: 'Carpintería', icon: 'hammer-outline' as const },
  ];

  const durations = [1, 2, 3, 4, 6, 8];

  const handleContinue = () => {
    if (!selectedService) return;

    navigation.navigate('BookingDateTime', {
      professionalId,
      serviceType: selectedService,
      durationHours,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Reserva</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Service Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona el servicio</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const isSelected = selectedService === service.id;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}>
                    <View style={[styles.serviceIcon, isSelected && styles.serviceIconSelected]}>
                      <Ionicons
                        name={service.icon}
                        size={28}
                        color={isSelected ? Colors.white : Colors.orange[500]}
                      />
                    </View>
                    <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                      {service.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Duration Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Duración estimada</Text>
          <View style={styles.durationsRow}>
            {durations.map((duration) => {
              const isSelected = durationHours === duration;
              return (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setDurationHours(duration)}
                  activeOpacity={0.7}
                  style={styles.durationItem}
                >
                  <View style={[styles.durationCard, isSelected && styles.durationCardSelected]}>
                    <Text style={[styles.durationText, isSelected && styles.durationTextSelected]}>
                      {duration}h
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.blue[500]} />
          </View>
          <Text style={styles.infoText}>
            La duración es una estimación. El profesional ajustará el tiempo según la complejidad del trabajo.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          disabled={!selectedService}
          variant="primary"
          size="lg"
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  serviceCardSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28, // rounded-full
    backgroundColor: Colors.orange[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIconSelected: {
    backgroundColor: Colors.orange[500],
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  serviceNameSelected: {
    color: Colors.orange[600],
  },
  durationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationItem: {
    flex: 1,
    minWidth: 70,
  },
  durationCard: {
    paddingVertical: 12,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  durationCardSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  durationTextSelected: {
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
});
