import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/providers/AuthProvider";
import {
  fetchDashboardStats,
  fetchUpcomingBookings,
  fetchFavoriteProfessionals,
  type DashboardStats,
  type UpcomingBooking,
} from "@/features/dashboard/api";
import type { ProfessionalProfile } from "@/features/professionals/types";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard";

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
  } = useQuery<ProfessionalProfile[], Error>({
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
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
                <Ionicons name="calendar-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.statNumber}>{stats.upcomingBookingsCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
              </View>
              <Text style={styles.statNumber}>{stats.completedBookingsCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="heart-outline" size={24} color="#DC2626" />
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

          {bookingsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : upcomingBookings && upcomingBookings.length > 0 ? (
            <View style={styles.bookingsList}>
              {upcomingBookings.map((booking) => (
                <Pressable
                  key={booking.id}
                  style={styles.bookingCard}
                  onPress={() => router.push(`/booking/${booking.id}`)}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingIcon}>
                      <Ionicons name="person-circle-outline" size={40} color="#2563EB" />
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingProfessional}>{booking.professionalName}</Text>
                      <Text style={styles.bookingService}>{booking.serviceName}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingDetailRow}>
                      <Ionicons name="calendar" size={16} color="#64748B" />
                      <Text style={styles.bookingDetailText}>
                        {booking.scheduledFor.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    <View style={styles.bookingDetailRow}>
                      <Ionicons name="time" size={16} color="#64748B" />
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
                        <Ionicons name="chatbubble-outline" size={16} color="#2563EB" />
                        <Text style={styles.bookingActionText}>Message</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Upcoming Bookings</Text>
              <Text style={styles.emptyDescription}>
                Book a service to get started
              </Text>
              <Pressable
                style={styles.browseProfessionalsButton}
                onPress={() => router.push("/professionals")}
              >
                <Text style={styles.browseProfessionalsText}>Browse Professionals</Text>
              </Pressable>
            </View>
          )}
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
                    professional={professional}
                    onPress={(id) => router.push(`/professionals/${id}`)}
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
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/professionals")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="search" size={24} color="#2563EB" />
              </View>
              <Text style={styles.quickActionText}>Browse</Text>
            </Pressable>

            <Pressable style={styles.quickActionCard} onPress={() => router.push("/bookings")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="calendar" size={24} color="#16A34A" />
              </View>
              <Text style={styles.quickActionText}>Bookings</Text>
            </Pressable>

            <Pressable style={styles.quickActionCard} onPress={() => router.push("/messages")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="chatbubbles" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Messages</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push("/payment-methods")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="card" size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>Payments</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
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
