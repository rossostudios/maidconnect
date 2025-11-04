import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  fetchPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/features/payments/api";
import type { PaymentMethod } from "@/features/payments/types";

export default function PaymentMethodsScreen() {
  const queryClient = useQueryClient();

  const {
    data: paymentMethods,
    isLoading,
    error,
    refetch,
  } = useQuery<PaymentMethod[], Error>({
    queryKey: ["paymentMethods"],
    queryFn: fetchPaymentMethods,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      Alert.alert("Success", "Payment method deleted");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      Alert.alert("Success", "Default payment method updated");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      "Delete Payment Method",
      `Remove ${method.card.brand?.toUpperCase()} ending in ${method.card.last4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(method.id),
        },
      ]
    );
  };

  const handleAddNew = () => {
    router.push("/add-payment-method");
  };

  const getCardIcon = (brand: string | null) => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      case "amex":
        return "card";
      default:
        return "card-outline";
    }
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Ionicons
            name={getCardIcon(item.card.brand)}
            size={32}
            color="#2563EB"
            style={styles.cardIcon}
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardBrand}>
                {item.card.brand?.toUpperCase() || "Card"}
              </Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardNumber}>•••• {item.card.last4}</Text>
            {item.card.expMonth && item.card.expYear && (
              <Text style={styles.expiry}>
                Expires {String(item.card.expMonth).padStart(2, "0")}/
                {item.card.expYear}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </Pressable>
      </View>

      {!item.isDefault && (
        <Pressable
          style={styles.setDefaultButton}
          onPress={() => setDefaultMutation.mutate(item.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </Pressable>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>No Payment Methods</Text>
      <Text style={styles.emptyDescription}>
        Add a payment method to book services
      </Text>
      <Pressable style={styles.addButton} onPress={handleAddNew}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorText}>{error.message}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      {paymentMethods && paymentMethods.length > 0 && (
        <View style={styles.footer}>
          <Pressable style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  cardNumber: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  expiry: {
    fontSize: 12,
    color: "#94A3B8",
  },
  deleteButton: {
    padding: 8,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
