import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getFeaturedProfessionals } from '@/lib/api/professionals';
import type { Professional } from '@/types/api/professional';
import { formatCurrency } from '@/lib/format';
import type { CurrencyCode } from '@/types/territories';

type Props = MainTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [featuredProfessionals, setFeaturedProfessionals] = useState<Professional[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeaturedProfessionals();
  }, []);

  const loadFeaturedProfessionals = async () => {
    try {
      const professionals = await getFeaturedProfessionals(5);
      setFeaturedProfessionals(professionals);
    } catch (error) {
      console.error('Error loading featured professionals:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedProfessionals();
    setRefreshing(false);
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

  const services = [
    { id: 1, name: 'Limpieza', icon: 'sparkles-outline' as const },
    { id: 2, name: 'Plomería', icon: 'water-outline' as const },
    { id: 3, name: 'Electricidad', icon: 'flash-outline' as const },
    { id: 4, name: 'Jardinería', icon: 'leaf-outline' as const },
    { id: 5, name: 'Pintura', icon: 'brush-outline' as const },
    { id: 6, name: 'Carpintería', icon: 'hammer-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hola, {user?.user_metadata?.full_name || 'Usuario'}</Text>
          <Text style={styles.subtitle}>¿Qué servicio necesitas hoy?</Text>
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Search')}
              >
                <Card style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons
                      name={service.icon}
                      size={32}
                      color={Colors.orange[500]}
                    />
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reservas Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.neutral[300]}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No tienes reservas recientes</Text>
            <Text style={styles.emptySubtext}>
              Explora nuestros servicios para hacer tu primera reserva
            </Text>
          </Card>
        </View>

        {/* Featured Professionals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profesionales Destacados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAllText}>Ver más</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.professionalsScroll}
          >
            {featuredProfessionals.length === 0 ? (
              <Card style={styles.emptyProfessionalsCard}>
                <Text style={styles.emptyProfessionalsText}>
                  Cargando profesionales...
                </Text>
              </Card>
            ) : (
              featuredProfessionals.map((professional) => {
                const currencyCode = getCurrencyCode(professional.country_code);
                const hourlyRate = professional.hourly_rate_cents / 100;

                return (
                  <TouchableOpacity
                    key={professional.id}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('ProfessionalDetail', {
                        professionalId: professional.id,
                      })
                    }
                  >
                    <Card style={styles.professionalCard}>
                      {professional.profile_picture_url ? (
                        <Image
                          source={{ uri: professional.profile_picture_url }}
                          style={styles.professionalAvatar}
                        />
                      ) : (
                        <View style={styles.professionalAvatar}>
                          <Ionicons
                            name="person"
                            size={32}
                            color={Colors.neutral[400]}
                          />
                        </View>
                      )}
                      <Text style={styles.professionalName} numberOfLines={1}>
                        {professional.full_name}
                      </Text>
                      <View style={styles.professionalRating}>
                        <Ionicons name="star" size={14} color={Colors.orange[500]} />
                        <Text style={styles.ratingText}>
                          {professional.rating?.toFixed(1) || '5.0'}
                        </Text>
                      </View>
                      <Text style={styles.professionalPrice}>
                        {formatCurrency(hourlyRate, currencyCode)}/h
                      </Text>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.orange[600],
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -6,
  },
  serviceCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 20,
    margin: 6,
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
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  professionalsScroll: {
    gap: 12,
  },
  emptyProfessionalsCard: {
    width: 140,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyProfessionalsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  professionalCard: {
    width: 140,
    alignItems: 'center',
    paddingVertical: 16,
  },
  professionalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // rounded-full
    backgroundColor: Colors.neutral[200],
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  professionalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  professionalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.orange[600],
  },
});
