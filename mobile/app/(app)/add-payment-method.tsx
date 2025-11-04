import { Ionicons } from "@expo/vector-icons";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  borderRadius,
  colors,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";
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

      Alert.alert("Success", "Payment method added successfully", [
        {
          text: "OK",
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
            router.back();
          },
        },
      ]);
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
          <Pressable disabled={loading} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={semanticColors.text.primary} name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.content}>
          <View style={styles.infoCard}>
            <Ionicons color={colors.primary[500]} name="lock-closed" size={20} />
            <Text style={styles.infoText}>
              Your card information is securely processed by Stripe
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              autoCapitalize="words"
              editable={!loading}
              label="Name on Card"
              onChangeText={setNameOnCard}
              placeholder="John Doe"
              required
              value={nameOnCard}
            />

            <View style={styles.cardDetailsGroup}>
              <Text style={styles.label}>Card Details *</Text>
              <View style={styles.cardFieldContainer}>
                <CardField
                  cardStyle={{
                    backgroundColor: semanticColors.background.primary,
                    textColor: semanticColors.text.primary,
                    placeholderColor: semanticColors.text.placeholder,
                  }}
                  disabled={loading}
                  onCardChange={(details) => {
                    setCardDetails(details);
                  }}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  postalCodeEnabled={false}
                  style={styles.cardField}
                />
              </View>
              <Text style={styles.hint}>Enter your card number, expiry date, and CVC</Text>
            </View>

            <Pressable
              disabled={loading}
              onPress={() => setSetAsDefault(!setAsDefault)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, setAsDefault && styles.checkboxChecked]}>
                {setAsDefault && (
                  <Ionicons color={semanticColors.text.inverse} name="checkmark" size={16} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default payment method</Text>
            </Pressable>
          </View>

          <View style={styles.testCardsInfo}>
            <Text style={styles.testCardsTitle}>Test Cards (Development)</Text>
            <Text style={styles.testCard}>• Visa: 4242 4242 4242 4242</Text>
            <Text style={styles.testCard}>• Mastercard: 5555 5555 5555 4444</Text>
            <Text style={styles.testCard}>• Use any future expiry date and any 3-digit CVC</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            disabled={loading}
            onPress={() => router.back()}
            style={styles.footerButton}
            variant="secondary"
          >
            Cancel
          </Button>

          <Button
            disabled={!(cardDetails?.complete && nameOnCard.trim()) || loading}
            loading={loading}
            onPress={handleSave}
            style={styles.footerButton}
            variant="primary"
          >
            Add Card
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: semanticColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.default,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: semanticColors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
  },
  form: {
    backgroundColor: semanticColors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  cardDetailsGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: semanticColors.text.primary,
    marginBottom: spacing.sm,
  },
  cardFieldContainer: {
    backgroundColor: semanticColors.background.secondary,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
  },
  cardField: {
    width: "100%",
    height: 50,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: semanticColors.text.tertiary,
    marginTop: spacing.xs,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: semanticColors.border.medium,
    borderRadius: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: semanticColors.text.secondary,
  },
  testCardsInfo: {
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.warning[100],
  },
  testCardsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[700],
    marginBottom: spacing.xs,
  },
  testCard: {
    fontSize: typography.fontSize.xs,
    color: colors.warning[700],
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: semanticColors.background.primary,
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.default,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
