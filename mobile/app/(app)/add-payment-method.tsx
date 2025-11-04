import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { savePaymentMethod } from "@/features/payments/api";

export default function AddPaymentMethodScreen() {
  const queryClient = useQueryClient();
  const { createPaymentMethod } = useStripe();

  const [cardDetails, setCardDetails] = useState<any>(null);
  const [nameOnCard, setNameOnCard] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Error", "Please enter valid card details");
      return;
    }

    if (!nameOnCard.trim()) {
      Alert.alert("Error", "Please enter the name on card");
      return;
    }

    setLoading(true);

    try {
      // Create payment method with Stripe
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: nameOnCard.trim(),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      // Save payment method to backend
      await savePaymentMethod({
        stripePaymentMethodId: paymentMethod.id,
        isDefault: setAsDefault,
      });

      Alert.alert(
        "Success",
        "Payment method added successfully",
        [
          {
            text: "OK",
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add payment method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              Your card information is securely processed by Stripe
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name on Card *</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={nameOnCard}
                onChangeText={setNameOnCard}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Details *</Text>
              <View style={styles.cardFieldContainer}>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    textColor: "#1E293B",
                    placeholderColor: "#94A3B8",
                  }}
                  style={styles.cardField}
                  onCardChange={(details) => {
                    setCardDetails(details);
                  }}
                  disabled={loading}
                />
              </View>
              <Text style={styles.hint}>
                Enter your card number, expiry date, and CVC
              </Text>
            </View>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setSetAsDefault(!setAsDefault)}
              disabled={loading}
            >
              <View
                style={[
                  styles.checkbox,
                  setAsDefault && styles.checkboxChecked,
                ]}
              >
                {setAsDefault && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default payment method</Text>
            </Pressable>
          </View>

          <View style={styles.testCardsInfo}>
            <Text style={styles.testCardsTitle}>Test Cards (Development)</Text>
            <Text style={styles.testCard}>
              • Visa: 4242 4242 4242 4242
            </Text>
            <Text style={styles.testCard}>
              • Mastercard: 5555 5555 5555 4444
            </Text>
            <Text style={styles.testCard}>
              • Use any future expiry date and any 3-digit CVC
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.cancelButton, loading && styles.buttonDisabled]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[
              styles.saveButton,
              (!cardDetails?.complete || !nameOnCard.trim() || loading) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={!cardDetails?.complete || !nameOnCard.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Add Card</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardView: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  cardFieldContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  cardField: {
    width: "100%",
    height: 50,
  },
  hint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#475569",
  },
  testCardsInfo: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  testCardsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 6,
  },
  testCard: {
    fontSize: 12,
    color: "#78350F",
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
