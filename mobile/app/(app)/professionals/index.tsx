import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors, spacing, typography } from "@/constants/design-tokens";
import { fetchProfessionals } from "@/features/professionals/api";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard";
import type { ProfessionalProfile } from "@/features/professionals/types";

const COMMON_SERVICES = ["Cleaning", "Deep Cleaning", "Laundry", "Organization", "Move In/Out"];
const SORT_OPTIONS = [
  { label: "Rating", value: "rating" },
  { label: "Distance", value: "distance" },
  { label: "Reviews", value: "reviews" },
] as const;

export default function ProfessionalsBrowseScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "reviews">("rating");

  const { data, error, isLoading, isRefetching, refetch } = useQuery<ProfessionalProfile[], Error>({
    queryKey: ["professionals", { limit: 50 }],
    queryFn: () => fetchProfessionals({ limit: 50 }),
    placeholderData: (previous) => previous,
  });

  // Filter and sort professionals
  const filteredProfessionals = useMemo(() => {
    let filtered = data ?? [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pro) =>
          pro.fullName?.toLowerCase().includes(query) ||
          pro.services.some((service) => service.name?.toLowerCase().includes(query))
      );
    }

    // Apply service filter
    if (selectedService) {
      filtered = filtered.filter((pro) =>
        pro.services.some(
          (service) =>
            service.name?.toLowerCase() === selectedService.toLowerCase() ||
            service.name?.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "distance":
          return (
            (a.distanceKm || Number.POSITIVE_INFINITY) - (b.distanceKm || Number.POSITIVE_INFINITY)
          );
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, searchQuery, selectedService, sortBy]);

  const errorMessage = error ? "Unable to load professionals. Pull to refresh to try again." : null;

  const handleProfessionalPress = (profileId: string) => {
    router.push(`/professionals/${profileId}`);
  };

  const renderItem = ({ item }: { item: ProfessionalProfile }) => (
    <ProfessionalCard onPress={handleProfessionalPress} professional={item} />
  );

  const keyExtractor = (item: ProfessionalProfile) => item.profileId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredProfessionals}
        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          filteredProfessionals.length === 0 && !isLoading ? (
            <EmptyState
              action={
                searchQuery || selectedService
                  ? {
                      label: "Clear Filters",
                      onPress: () => {
                        setSearchQuery("");
                        setSelectedService(null);
                      },
                      variant: "outline",
                    }
                  : undefined
              }
              description={
                searchQuery || selectedService
                  ? "Try adjusting your search or filters"
                  : "Once professionals finish onboarding, you will see them here"
              }
              icon="search-outline"
              title={
                searchQuery || selectedService
                  ? "No matching professionals"
                  : "No professionals yet"
              }
            />
          ) : null
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Browse Professionals</Text>
              <Text style={styles.subtitle}>
                Find and book trusted cleaning professionals in your area
              </Text>
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                color={semanticColors.text.placeholder}
                name="search"
                size={20}
                style={styles.searchIcon}
              />
              <TextInput
                onChangeText={setSearchQuery}
                placeholder="Search by name or service..."
                placeholderTextColor={semanticColors.text.placeholder}
                returnKeyType="search"
                style={styles.searchInput}
                value={searchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
                  <Ionicons color={semanticColors.text.placeholder} name="close-circle" size={20} />
                </Pressable>
              )}
            </View>

            {/* Service Filter Chips */}
            <ScrollView
              contentContainerStyle={styles.filterChips}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {COMMON_SERVICES.map((service) => (
                <Chip
                  key={service}
                  onPress={() => setSelectedService(selectedService === service ? null : service)}
                  selected={selectedService === service}
                  variant="outlined"
                >
                  {service}
                </Chip>
              ))}
            </ScrollView>

            {/* Sort Options */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  selected={sortBy === option.value}
                  size="sm"
                  variant="filled"
                >
                  {option.label}
                </Chip>
              ))}
            </View>

            {/* Results Count */}
            <Text style={styles.resultsCount}>
              {filteredProfessionals.length} professional
              {filteredProfessionals.length !== 1 ? "s" : ""} found
            </Text>
          </>
        }
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        renderItem={renderItem}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.primary[500]} size="large" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: semanticColors.background.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    color: semanticColors.text.secondary,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: semanticColors.status.error,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.background.primary,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: semanticColors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterChips: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: semanticColors.text.secondary,
    marginRight: spacing.xs,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: semanticColors.text.secondary,
    marginBottom: spacing.lg,
  },
});
