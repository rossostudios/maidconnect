import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/colors';

type Props = MainTabScreenProps<'Search'>;

export function SearchScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Input
          placeholder="Buscar servicios o profesionales..."
          containerStyle={styles.searchInput}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Busca profesionales por servicio, nombre o ubicación
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
