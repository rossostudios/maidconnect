import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

type Props = MainTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <TouchableOpacity key={service.id} activeOpacity={0.7}>
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

        {/* Popular Professionals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profesionales Destacados</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.professionalsScroll}
          >
            {[1, 2, 3].map((i) => (
              <Card key={i} style={styles.professionalCard}>
                <View style={styles.professionalAvatar} />
                <Text style={styles.professionalName}>Profesional {i}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={Colors.orange[500]} />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </Card>
            ))}
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
    borderRadius: 28, // rounded-full equivalent
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
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
});
