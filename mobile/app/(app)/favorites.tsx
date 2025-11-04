import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchFavorites, removeFavorite } from "@/features/favorites/api";
import { fetchProfessionals } from "@/features/professionals/api";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard";
import type { ProfessionalProfile } from "@/features/professionals/types";

export default function FavoritesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch favorite IDs
  const { data: favoriteIds, isLoading: loadingIds } = useQuery<string[], Error>({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });

  // Fetch all professionals
  const {
    data: allProfessionals,
    isLoading: loadingProfs,
    isRefetching,
    refetch,
  } = useQuery<ProfessionalProfile[], Error>({
    queryKey: ["professionals"],
    queryFn: () => fetchProfessionals({ limit: 100 }),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      Alert.alert("Success", "Removed from favorites");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to remove favorite");
    },
  });

  const handleProfessionalPress = (profileId: string) => {
    router.push(`/professionals/${profileId}`);
  };

  const handleRemoveFavorite = (professionalId: string, name: string) => {
    Alert.alert("Remove Favorite", `Remove ${name} from favorites?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMutation.mutate(professionalId),
      },
    ]);
  };

  const isLoading = loadingIds || loadingProfs;

  // Filter professionals to only show favorited ones
  const favoriteProfessionals =
    allProfessionals?.filter((prof) => favoriteIds?.includes(prof.profileId)) || [];

  const renderProfessional = ({ item }: { item: ProfessionalProfile }) => (
    <View>
      <ProfessionalCard onPress={handleProfessionalPress} professional={item} />
      <Pressable
        onPress={() => handleRemoveFavorite(item.profileId, item.fullName || "professional")}
        style={styles.removeButton}
      >
        <Ionicons color="#DC2626" name="heart-dislike-outline" size={20} />
        <Text style={styles.removeButtonText}>Remove from Favorites</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteProfessionals.length}{" "}
          {favoriteProfessionals.length === 1 ? "professional" : "professionals"}
        </Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={favoriteProfessionals}
        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
        keyExtractor={(item) => item.profileId}
        ListEmptyComponent={
          <EmptyState
            action={{
              label: "Browse Professionals",
              onPress: () => router.push("/"),
              variant: "primary",
            }}
            description="Tap the heart icon on any professional's profile to add them to your favorites for quick access."
            icon="heart-outline"
            title="No favorites yet"
          />
        }
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        renderItem={renderProfessional}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#64748B",
  },
  browseButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
