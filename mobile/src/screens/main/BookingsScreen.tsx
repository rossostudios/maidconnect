import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type Props = MainTabScreenProps<'Bookings'>;

export function BookingsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.emptyCard}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={Colors.neutral[300]}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No tienes reservas</Text>
          <Text style={styles.emptyText}>
            Cuando hagas una reserva, aparecerá aquí
          </Text>
        </Card>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
