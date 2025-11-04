import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBooking } from "@/features/bookings/api";
import type { CreateBookingParams } from "@/features/bookings/types";
import { fetchPaymentMethods } from "@/features/payments/api";
import type { PaymentMethod } from "@/features/payments/types";
import { fetchProfessionalDetails } from "@/features/professionals/api";
import type { ProfessionalProfile } from "@/features/professionals/types";

type BookingStep = "service" | "datetime" | "duration" | "address" | "payment" | "review";

type BookingFormData = {
  serviceName: string;
  serviceRate: number | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  durationHours: number;
  address: string;
  specialInstructions: string;
  selectedPaymentMethodId: string | null;
};

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function BookingCreateScreen() {
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [formData, setFormData] = useState<BookingFormData>({
    serviceName: "",
    serviceRate: null,
    selectedDate: null,
    selectedTime: null,
    durationHours: 2,
    address: "",
    specialInstructions: "",
    selectedPaymentMethodId: null,
  });

  const { data: professional, isLoading } = useQuery<ProfessionalProfile, Error>({
    queryKey: ["professional", professionalId],
    queryFn: () => fetchProfessionalDetails(professionalId!),
    enabled: !!professionalId,
  });

  const { data: paymentMethods } = useQuery<PaymentMethod[], Error>({
    queryKey: ["paymentMethods"],
    queryFn: fetchPaymentMethods,
  });

  const selectedPaymentMethod =
    paymentMethods?.find((method) => method.id === formData.selectedPaymentMethodId) || null;

  const handleBack = () => {
    const steps: BookingStep[] = [
      "service",
      "datetime",
      "duration",
      "address",
      "payment",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === 0) {
      router.back();
    } else {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const steps: BookingStep[] = [
      "service",
      "datetime",
      "duration",
      "address",
      "payment",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleServiceSelect = (serviceName: string, rate: number | null) => {
    setFormData((prev) => ({ ...prev, serviceName, serviceRate: rate }));
    handleNext();
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, selectedTime: time }));
  };

  const handleDurationSelect = (hours: number) => {
    setFormData((prev) => ({ ...prev, durationHours: hours }));
  };

  const calculateTotal = () => {
    if (!formData.serviceRate) {
      return 0;
    }
    return formData.serviceRate * formData.durationHours;
  };

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        return !!formData.serviceName;
      case "datetime":
        return !!formData.selectedDate && !!formData.selectedTime;
      case "duration":
        return formData.durationHours > 0;
      case "address":
        return formData.address.trim().length > 0;
      case "payment":
        return !!formData.selectedPaymentMethodId;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !(professionalId && formData.selectedDate && formData.selectedTime && formData.serviceRate)
    ) {
      Alert.alert("Error", "Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create scheduledStart datetime
      const [hours, minutes] = formData.selectedTime.split(":").map(Number);
      const scheduledStart = new Date(formData.selectedDate);
      scheduledStart.setHours(hours, minutes, 0, 0);

      // Calculate scheduledEnd
      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setHours(scheduledStart.getHours() + formData.durationHours);

      // Calculate total amount
      const amount = Math.round(formData.serviceRate * formData.durationHours);

      // Prepare booking params
      const bookingParams: CreateBookingParams = {
        professionalId,
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        durationMinutes: formData.durationHours * 60,
        amount,
        currency: "cop",
        specialInstructions: formData.specialInstructions || undefined,
        address: { label: formData.address },
        serviceName: formData.serviceName,
        serviceHourlyRate: formData.serviceRate,
      };

      // Create booking
      const _response = await createBooking(bookingParams);

      Alert.alert(
        "Booking Created!",
        "Your booking has been created successfully. You'll receive a confirmation shortly.",
        [
          {
            text: "View Bookings",
            onPress: () => router.push("/bookings"),
          },
        ]
      );
    } catch (error) {
      console.error("Booking submission error:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Unable to create booking. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !professional) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading professional details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons color="#0F172A" name="arrow-back" size={24} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Book {professional.fullName}</Text>
            <Text style={styles.headerSubtitle}>Step {getStepNumber(currentStep)} of 6</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${getStepProgress(currentStep)}%` }]} />
        </View>

        {/* Step Content */}
        <ScrollView contentContainerStyle={styles.contentContainer} style={styles.content}>
          {currentStep === "service" && (
            <ServiceStep
              onServiceSelect={handleServiceSelect}
              selectedService={formData.serviceName}
              services={professional.services}
            />
          )}

          {currentStep === "datetime" && (
            <DateTimeStep
              onDateSelect={(date) => setFormData((prev) => ({ ...prev, selectedDate: date }))}
              onTimeSelect={handleTimeSelect}
              selectedDate={formData.selectedDate}
              selectedTime={formData.selectedTime}
            />
          )}

          {currentStep === "duration" && (
            <DurationStep
              durationHours={formData.durationHours}
              onDurationSelect={handleDurationSelect}
              serviceRate={formData.serviceRate}
            />
          )}

          {currentStep === "address" && (
            <AddressStep
              address={formData.address}
              onAddressChange={(address) => setFormData((prev) => ({ ...prev, address }))}
              onInstructionsChange={(instructions) =>
                setFormData((prev) => ({ ...prev, specialInstructions: instructions }))
              }
              specialInstructions={formData.specialInstructions}
            />
          )}

          {currentStep === "payment" && (
            <PaymentStep
              onPaymentMethodSelect={(methodId) =>
                setFormData((prev) => ({ ...prev, selectedPaymentMethodId: methodId }))
              }
              selectedPaymentMethodId={formData.selectedPaymentMethodId}
            />
          )}

          {currentStep === "review" && (
            <ReviewStep
              formData={formData}
              professional={professional}
              selectedPaymentMethod={selectedPaymentMethod}
              total={calculateTotal()}
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep === "review" ? (
            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Creating Booking...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Confirm & Pay</Text>
                  <Text style={styles.submitButtonSubtext}>
                    ${calculateTotal().toLocaleString()} COP
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              disabled={!canProceed()}
              onPress={handleNext}
              style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons color="#FFFFFF" name="arrow-forward" size={20} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Service Selection Step
function ServiceStep({
  services,
  selectedService,
  onServiceSelect,
}: {
  services: ProfessionalProfile["services"];
  selectedService: string;
  onServiceSelect: (name: string, rate: number | null) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Service</Text>
      <Text style={styles.stepDescription}>Choose the service you need</Text>

      <View style={styles.servicesList}>
        {services.map((service, index) => (
          <Pressable
            key={index}
            onPress={() => onServiceSelect(service.name || "", service.hourlyRateCop)}
            style={[
              styles.serviceCard,
              selectedService === service.name && styles.serviceCardSelected,
            ]}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{service.name || "Service"}</Text>
              {service.description && (
                <Text style={styles.serviceDescription}>{service.description}</Text>
              )}
            </View>
            <View style={styles.serviceRate}>
              <Text style={styles.serviceRateAmount}>
                ${service.hourlyRateCop?.toLocaleString() || "—"}
              </Text>
              <Text style={styles.serviceRateUnit}>COP/hr</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Date & Time Step
function DateTimeStep({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}) {
  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepDescription}>Choose when you need the service</Text>

      <Text style={styles.sectionLabel}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
        <View style={styles.datesContainer}>
          {dates.map((date, index) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <Pressable
                key={index}
                onPress={() => onDateSelect(date)}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                  {date.getDate()}
                </Text>
                <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>Time</Text>
      <View style={styles.timeSlotsContainer}>
        {TIME_SLOTS.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <Pressable
              key={time}
              onPress={() => onTimeSelect(time)}
              style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
            >
              <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                {time}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Duration Step
function DurationStep({
  durationHours,
  onDurationSelect,
  serviceRate,
}: {
  durationHours: number;
  onDurationSelect: (hours: number) => void;
  serviceRate: number | null;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Duration</Text>
      <Text style={styles.stepDescription}>How many hours do you need?</Text>

      <View style={styles.durationGrid}>
        {DURATION_OPTIONS.map((hours) => {
          const isSelected = durationHours === hours;
          const cost = serviceRate ? serviceRate * hours : 0;

          return (
            <Pressable
              key={hours}
              onPress={() => onDurationSelect(hours)}
              style={[styles.durationCard, isSelected && styles.durationCardSelected]}
            >
              <Text style={[styles.durationHours, isSelected && styles.durationHoursSelected]}>
                {hours}h
              </Text>
              <Text style={[styles.durationCost, isSelected && styles.durationCostSelected]}>
                ${cost.toLocaleString()} COP
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Address Step
function AddressStep({
  address,
  specialInstructions,
  onAddressChange,
  onInstructionsChange,
}: {
  address: string;
  specialInstructions: string;
  onAddressChange: (address: string) => void;
  onInstructionsChange: (instructions: string) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Service Location</Text>
      <Text style={styles.stepDescription}>Where should the professional come?</Text>

      <Text style={styles.inputLabel}>Address *</Text>
      <TextInput
        multiline
        numberOfLines={3}
        onChangeText={onAddressChange}
        placeholder="Enter your full address"
        placeholderTextColor="#94A3B8"
        style={styles.textInput}
        value={address}
      />

      <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
      <TextInput
        multiline
        numberOfLines={4}
        onChangeText={onInstructionsChange}
        placeholder="Any specific instructions or requirements?"
        placeholderTextColor="#94A3B8"
        style={[styles.textInput, styles.textInputLarge]}
        value={specialInstructions}
      />
    </View>
  );
}

// Payment Step
function PaymentStep({
  selectedPaymentMethodId,
  onPaymentMethodSelect,
}: {
  selectedPaymentMethodId: string | null;
  onPaymentMethodSelect: (methodId: string) => void;
}) {
  const router = useRouter();

  const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[], Error>({
    queryKey: ["paymentMethods"],
    queryFn: fetchPaymentMethods,
  });

  if (isLoading) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Payment Method</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </View>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Payment Method</Text>
        <Text style={styles.stepDescription}>Add a payment method to continue</Text>

        <View style={styles.emptyPaymentState}>
          <Ionicons color="#CBD5E1" name="card-outline" size={64} />
          <Text style={styles.emptyPaymentTitle}>No Payment Methods</Text>
          <Text style={styles.emptyPaymentDescription}>
            Add a payment method to complete your booking
          </Text>
          <Pressable
            onPress={() => router.push("/add-payment-method")}
            style={styles.addPaymentButton}
          >
            <Ionicons color="#FFFFFF" name="add" size={20} />
            <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepDescription}>Select how you'd like to pay</Text>

      <View style={styles.paymentMethodsList}>
        {paymentMethods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => onPaymentMethodSelect(method.id)}
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethodId === method.id && styles.paymentMethodCardSelected,
            ]}
          >
            <View style={styles.paymentMethodLeft}>
              <Ionicons color="#2563EB" name="card" size={32} style={styles.paymentMethodIcon} />
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodTitleRow}>
                  <Text style={styles.paymentMethodBrand}>
                    {method.card.brand?.toUpperCase() || "Card"}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.paymentMethodNumber}>•••• {method.card.last4}</Text>
                {method.card.expMonth && method.card.expYear && (
                  <Text style={styles.paymentMethodExpiry}>
                    Expires {String(method.card.expMonth).padStart(2, "0")}/{method.card.expYear}
                  </Text>
                )}
              </View>
            </View>

            {selectedPaymentMethodId === method.id && (
              <Ionicons color="#2563EB" name="checkmark-circle" size={24} />
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/add-payment-method")}
        style={styles.addAnotherPaymentButton}
      >
        <Ionicons color="#2563EB" name="add-circle-outline" size={20} />
        <Text style={styles.addAnotherPaymentText}>Add Another Payment Method</Text>
      </Pressable>
    </View>
  );
}

// Review Step
function ReviewStep({
  formData,
  professional,
  total,
  selectedPaymentMethod,
}: {
  formData: BookingFormData;
  professional: ProfessionalProfile;
  total: number;
  selectedPaymentMethod: PaymentMethod | null;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review Booking</Text>
      <Text style={styles.stepDescription}>Please confirm your booking details</Text>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Professional</Text>
        <Text style={styles.reviewText}>{professional.fullName}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Service</Text>
        <Text style={styles.reviewText}>{formData.serviceName}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Date & Time</Text>
        <Text style={styles.reviewText}>
          {formData.selectedDate?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.reviewText}>{formData.selectedTime}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Duration</Text>
        <Text style={styles.reviewText}>{formData.durationHours} hours</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Address</Text>
        <Text style={styles.reviewText}>{formData.address}</Text>
      </View>

      {formData.specialInstructions && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Special Instructions</Text>
          <Text style={styles.reviewText}>{formData.specialInstructions}</Text>
        </View>
      )}

      {selectedPaymentMethod && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Payment Method</Text>
          <View style={styles.reviewPaymentMethod}>
            <Ionicons color="#2563EB" name="card" size={20} />
            <Text style={styles.reviewText}>
              {selectedPaymentMethod.card.brand?.toUpperCase() || "Card"} ••••{" "}
              {selectedPaymentMethod.card.last4}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${total.toLocaleString()} COP</Text>
      </View>
    </View>
  );
}

// Helper functions
function getStepNumber(step: BookingStep): number {
  const steps: BookingStep[] = ["service", "datetime", "duration", "address", "payment", "review"];
  return steps.indexOf(step) + 1;
}

function getStepProgress(step: BookingStep): number {
  const stepNumber = getStepNumber(step);
  return (stepNumber / 6) * 100;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#F1F5F9",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 20,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  serviceCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  serviceRate: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  serviceRateAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
  },
  serviceRateUnit: {
    fontSize: 12,
    color: "#64748B",
  },
  datesScroll: {
    marginBottom: 24,
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateCard: {
    width: 80,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  dateCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  dateDay: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  dateDaySelected: {
    color: "#2563EB",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginVertical: 4,
  },
  dateNumberSelected: {
    color: "#2563EB",
  },
  dateMonth: {
    fontSize: 12,
    color: "#64748B",
  },
  dateMonthSelected: {
    color: "#2563EB",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeSlotSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  timeSlotTextSelected: {
    color: "#2563EB",
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  durationCard: {
    width: "22%",
    paddingVertical: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  durationCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  durationHours: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  durationHoursSelected: {
    color: "#2563EB",
  },
  durationCost: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  durationCostSelected: {
    color: "#2563EB",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  textInput: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  textInputLarge: {
    minHeight: 120,
  },
  reviewSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 24,
  },
  reviewPaymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563EB",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  submitButton: {
    paddingVertical: 16,
    backgroundColor: "#22C55E",
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  submitButtonSubtext: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  emptyPaymentState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyPaymentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPaymentDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paymentMethodsList: {
    gap: 12,
    marginBottom: 20,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentMethodBrand: {
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
  paymentMethodNumber: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: "#94A3B8",
  },
  addAnotherPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderStyle: "dashed",
  },
  addAnotherPaymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
});
