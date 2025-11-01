import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fetchProfessionals } from '@/features/professionals/api';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard';
import type { ProfessionalProfile } from '@/features/professionals/types';

export default function ProfessionalsScreen() {
  const { data, error, isLoading, isRefetching, refetch } = useQuery<
    ProfessionalProfile[],
    Error
  >({
    queryKey: ['professionals', { limit: 25 }],
    queryFn: () => fetchProfessionals({ limit: 25 }),
    placeholderData: (previous) => previous,
  });

  const professionals = data ?? [];
  const errorMessage = error
    ? 'Unable to load professionals. Pull to refresh to try again.'
    : null;

  const renderItem = ({ item }: { item: ProfessionalProfile }) => (
    <ProfessionalCard professional={item} />
  );

  const keyExtractor = (item: ProfessionalProfile) => item.profileId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={professionals}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Professionals</Text>
            <Text style={styles.subtitle}>
              Track real-time performance and quickly match clients with trusted professionals.
            </Text>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          professionals.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No professionals yet</Text>
              <Text style={styles.emptyDescription}>
                Once professionals finish onboarding, you will see them here with their safety metrics.
              </Text>
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#475569',
  },
});
