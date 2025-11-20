import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '@/types/navigation';
import { Input } from '@/components/Input';
import { ProfessionalCard } from '@/components/professionals/ProfessionalCard';
import { SearchFilters } from '@/components/professionals/SearchFilters';
import { Colors } from '@/constants/colors';
import { searchProfessionals } from '@/lib/api/professionals';
import type { Professional, ProfessionalSearchParams } from '@/types/api/professional';

type Props = MainTabScreenProps<'Search'>;

export function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProfessionalSearchParams>({});
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfessionals();
  }, [filters]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const result = await searchProfessionals(filters);
      setProfessionals(result.professionals);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfessionals();
    setRefreshing(false);
  };

  const handleProfessionalPress = (professional: Professional) => {
    navigation.navigate('ProfessionalDetail', { professionalId: professional.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Search Input */}
        <Input
          placeholder="Buscar servicios o profesionales..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Filters */}
          <SearchFilters filters={filters} onFilterChange={setFilters} />

          {/* Results */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {professionals.length} profesionales encontrados
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.orange[500]} />
              </View>
            ) : professionals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No se encontraron profesionales
                </Text>
                <Text style={styles.emptySubtext}>
                  Intenta ajustar tus filtros de búsqueda
                </Text>
              </View>
            ) : (
              professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onPress={() => handleProfessionalPress(professional)}
                />
              ))
            )}
          </View>
        </ScrollView>
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
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
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
  },
});
