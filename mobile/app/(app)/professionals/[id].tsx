import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isFavorited, toggleFavorite } from "@/features/favorites/api";
import { createConversation } from "@/features/messaging/api";
import { fetchProfessionalDetails } from "@/features/professionals/api";
import type { ProfessionalProfile } from "@/features/professionals/types";

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: professional,
    error,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<ProfessionalProfile, Error>({
    queryKey: ["professional", id],
    queryFn: () => fetchProfessionalDetails(id!),
    enabled: !!id,
  });

  const { data: favorited, isLoading: loadingFavorite } = useQuery<boolean, Error>({
    queryKey: ["favorite", id],
    queryFn: () => isFavorited(id!),
    enabled: !!id,
  });

  const createConversationMutation = useMutation({
    mutationFn: () => createConversation({ otherUserId: id! }),
    onSuccess: (conversationId) => {
      router.push(`/messages/${conversationId}`);
    },
    onError: (conversationError: Error) => {
      Alert.alert("Error", conversationError.message || "Failed to start conversation");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(id!),
    onSuccess: (newFavoriteState) => {
      queryClient.invalidateQueries({ queryKey: ["favorite", id] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      Alert.alert("Success", newFavoriteState ? "Added to favorites!" : "Removed from favorites");
    },
    onError: (favoriteError: Error) => {
      Alert.alert("Error", favoriteError.message || "Failed to update favorite");
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading professional...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !professional) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons color="#DC2626" name="alert-circle-outline" size={48} />
          <Text style={styles.errorTitle}>Unable to load professional</Text>
          <Text style={styles.errorMessage}>{error?.message || "Professional not found"}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    router.push({
      pathname: "/booking/create",
      params: { professionalId: id },
    });
  };

  const handleMessage = () => {
    createConversationMutation.mutate();
  };

  const handleToggleFavorite = () => {
    favoriteMutation.mutate();
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backIconButton}>
            <Ionicons color="#0F172A" name="arrow-back" size={24} />
          </Pressable>
          <Pressable
            disabled={favoriteMutation.isPending || loadingFavorite}
            onPress={handleToggleFavorite}
            style={styles.favoriteButton}
          >
            {favoriteMutation.isPending ? (
              <ActivityIndicator color="#DC2626" size="small" />
            ) : (
              <Ionicons
                color={favorited ? "#DC2626" : "#64748B"}
                name={favorited ? "heart" : "heart-outline"}
                size={28}
              />
            )}
          </Pressable>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {professional.fullName?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            {professional.verificationLevel && (
              <View style={styles.verificationBadge}>
                <Ionicons color="#22C55E" name="checkmark-circle" size={20} />
              </View>
            )}
          </View>

          <Text style={styles.fullName}>{professional.fullName || "Professional"}</Text>

          <View style={styles.statsRow}>
            {professional.rating !== null && (
              <View style={styles.statItem}>
                <Ionicons color="#F59E0B" name="star" size={16} />
                <Text style={styles.statText}>
                  {professional.rating.toFixed(1)} ({professional.reviewCount})
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons color="#2563EB" name="checkmark-done" size={16} />
              <Text style={styles.statText}>{professional.totalCompletedBookings} jobs</Text>
            </View>
            {professional.onTimeRate !== null && (
              <View style={styles.statItem}>
                <Ionicons color="#10B981" name="time" size={16} />
                <Text style={styles.statText}>
                  {(professional.onTimeRate * 100).toFixed(0)}% on-time
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons color="#64748B" name="location-outline" size={16} />
            <Text style={styles.locationText}>
              {[professional.city, professional.country].filter(Boolean).join(", ") ||
                "Location not specified"}
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        {professional.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{professional.bio}</Text>
          </View>
        )}

        {/* Experience & Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience & Languages</Text>
          <View style={styles.infoRow}>
            <Ionicons color="#2563EB" name="briefcase-outline" size={20} />
            <Text style={styles.infoText}>
              {professional.experienceYears
                ? `${professional.experienceYears} years of experience`
                : "Experience not specified"}
            </Text>
          </View>
          {professional.languages.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons color="#2563EB" name="language-outline" size={20} />
              <Text style={styles.infoText}>{professional.languages.join(", ")}</Text>
            </View>
          )}
        </View>

        {/* Services & Pricing */}
        {professional.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services & Rates</Text>
            {professional.services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name || "Service"}</Text>
                  {service.hourlyRateCop !== null && (
                    <Text style={styles.serviceRate}>
                      ${service.hourlyRateCop.toLocaleString()} COP/hr
                    </Text>
                  )}
                </View>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Primary Services */}
        {professional.primaryServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.tagContainer}>
              {professional.primaryServices.map((service, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Availability Preview */}
        {professional.availability.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {professional.availability.slice(0, 3).map((slot, index) => (
              <View key={index} style={styles.availabilityRow}>
                <Text style={styles.availabilityDay}>{slot.day}</Text>
                <Text style={styles.availabilityTime}>
                  {slot.start} - {slot.end}
                </Text>
              </View>
            ))}
            {professional.availability.length > 3 && (
              <Text style={styles.availabilityMore}>
                +{professional.availability.length - 3} more days
              </Text>
            )}
          </View>
        )}

        {/* Bottom spacing for fixed buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        <Pressable
          disabled={createConversationMutation.isPending}
          onPress={handleMessage}
          style={styles.messageButton}
        >
          {createConversationMutation.isPending ? (
            <ActivityIndicator color="#2563EB" size="small" />
          ) : (
            <>
              <Ionicons color="#2563EB" name="chatbubble-outline" size={20} />
              <Text style={styles.messageButtonText}>Message</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={handleBookNow} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  verificationBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  fullName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#475569",
    flex: 1,
  },
  serviceCard: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  serviceRate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  availabilityDay: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    textTransform: "capitalize",
  },
  availabilityTime: {
    fontSize: 15,
    color: "#64748B",
  },
  availabilityMore: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 8,
    fontWeight: "500",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
  bookButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#2563EB",
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
