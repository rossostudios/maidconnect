import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type DashboardStats,
  fetchDashboardStats,
  fetchFavoriteProfessionals,
  fetchUpcomingBookings,
  type UpcomingBooking,
} from "@/features/dashboard/api";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard";
import type { ProfessionalSummary } from "@/features/professionals/types";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardScreen() {
  const { session } = useAuth();
  const userName = session?.user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery<DashboardStats, Error>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const {
    data: upcomingBookings,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery<UpcomingBooking[], Error>({
    queryKey: ["upcomingBookings"],
    queryFn: fetchUpcomingBookings,
  });

  const {
    data: favoriteProfessionals,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useQuery<ProfessionalSummary[], Error>({
    queryKey: ["favoriteProfessionals"],
    queryFn: fetchFavoriteProfessionals,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchBookings(), refetchFavorites()]);
    setRefreshing(false);
  };

  const isLoading = statsLoading || bookingsLoading || favoritesLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
        style={styles.container}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}!</Text>
        </View>

        {/* Stats Cards */}
        {!statsLoading && stats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons color="#2563EB" name="calendar-outline" size={24} />
              </View>
              <Text style={styles.statNumber}>{stats.upcomingBookingsCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons color="#16A34A" name="checkmark-circle-outline" size={24} />
              </View>
              <Text style={styles.statNumber}>{stats.completedBookingsCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons color="#DC2626" name="heart-outline" size={24} />
              </View>
              <Text style={styles.statNumber}>{stats.favoritesCount}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        )}

        {/* Upcoming Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            {upcomingBookings && upcomingBookings.length > 0 && (
              <Pressable onPress={() => router.push("/bookings")}>
                <Text style={styles.sectionLink}>View All</Text>
              </Pressable>
            )}
          </View>

          {(() => {
            if (bookingsLoading) {
              return (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#2563EB" />
                </View>
              );
            }
            if (upcomingBookings && upcomingBookings.length > 0) {
              return (
                <View style={styles.bookingsList}>
                  {upcomingBookings.map((booking) => (
                    <Pressable
                      key={booking.id}
                      onPress={() => router.push(`/booking/${booking.id}`)}
                      style={styles.bookingCard}
                    >
                      <View style={styles.bookingHeader}>
                        <View style={styles.bookingIcon}>
                          <Ionicons color="#2563EB" name="person-circle-outline" size={40} />
                        </View>
                        <View style={styles.bookingInfo}>
                          <Text style={styles.bookingProfessional}>{booking.professionalName}</Text>
                          <Text style={styles.bookingService}>{booking.serviceName}</Text>
                        </View>
                      </View>

                      <View style={styles.bookingDetails}>
                        <View style={styles.bookingDetailRow}>
                          <Ionicons color="#64748B" name="calendar" size={16} />
                          <Text style={styles.bookingDetailText}>
                            {booking.scheduledFor.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                        <View style={styles.bookingDetailRow}>
                          <Ionicons color="#64748B" name="time" size={16} />
                          <Text style={styles.bookingDetailText}>
                            {booking.scheduledFor.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.bookingFooter}>
                        <Text style={styles.bookingAmount}>
                          ${booking.totalAmount.toLocaleString()} COP
                        </Text>
                        <View style={styles.bookingActions}>
                          <Pressable style={styles.bookingActionButton}>
                            <Ionicons color="#2563EB" name="chatbubble-outline" size={16} />
                            <Text style={styles.bookingActionText}>Message</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              );
            }
            return (
              <View style={styles.emptyState}>
                <Ionicons color="#CBD5E1" name="calendar-outline" size={48} />
                <Text style={styles.emptyTitle}>No Upcoming Bookings</Text>
                <Text style={styles.emptyDescription}>Book a service to get started</Text>
                <Pressable
                  onPress={() => router.push("/professionals")}
                  style={styles.browseProfessionalsButton}
                >
                  <Text style={styles.browseProfessionalsText}>Browse Professionals</Text>
                </Pressable>
              </View>
            );
          })()}
        </View>

        {/* Favorites Section */}
        {!favoritesLoading && favoriteProfessionals && favoriteProfessionals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favorite Professionals</Text>
              <Pressable onPress={() => router.push("/favorites")}>
                <Text style={styles.sectionLink}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.favoritesList}>
              {favoriteProfessionals.map((professional) => (
                <View key={professional.profileId} style={styles.favoriteProfessionalItem}>
                  <ProfessionalCard
                    onPress={(id) => router.push(`/professionals/${id}`)}
                    professional={professional}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsGrid}>
            <Pressable onPress={() => router.push("/professionals")} style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons color="#2563EB" name="search" size={24} />
              </View>
              <Text style={styles.quickActionText}>Browse</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/bookings")} style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons color="#16A34A" name="calendar" size={24} />
              </View>
              <Text style={styles.quickActionText}>Bookings</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/messages")} style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons color="#D97706" name="chatbubbles" size={24} />
              </View>
              <Text style={styles.quickActionText}>Messages</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/payment-methods")}
              style={styles.quickActionCard}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons color="#9333EA" name="card" size={24} />
              </View>
              <Text style={styles.quickActionText}>Payments</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  bookingsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingIcon: {
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingProfessional: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  bookingService: {
    fontSize: 14,
    color: "#64748B",
  },
  bookingDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingDetailText: {
    fontSize: 14,
    color: "#475569",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
  bookingActions: {
    flexDirection: "row",
    gap: 8,
  },
  bookingActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
  },
  bookingActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  browseProfessionalsButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseProfessionalsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  favoritesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  favoriteProfessionalItem: {
    marginBottom: 6,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
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
});
