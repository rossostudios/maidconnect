/**
 * Reschedule Modal Component
 * Allows users to reschedule a booking to a new date and time
 * Refactored to use the new design system components
 */

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { borderRadius, colors, semanticColors, spacing } from "@/constants/design-tokens";

type RescheduleModalProps = {
  visible: boolean;
  currentDate: Date;
  onClose: () => void;
  onSubmit: (newDate: string, newTime: string) => Promise<void>;
};

export function RescheduleModal({ visible, currentDate, onClose, onSubmit }: RescheduleModalProps) {
  const [date, setDate] = useState(new Date(currentDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate that the new date is in the future
    if (date <= new Date()) {
      Alert.alert("Invalid Date", "Please select a future date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date as YYYY-MM-DD
      const newDate = date.toISOString().split("T")[0];
      // Format time as HH:mm:ss
      const newTime = date.toTimeString().split(" ")[0];

      await onSubmit(newDate, newTime);
      onClose();
    } catch (error) {
      console.error("Failed to reschedule booking:", error);
      Alert.alert("Error", "Failed to reschedule booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDate(new Date(currentDate));
    onClose();
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Modal onClose={handleClose} scrollable={false} title="Reschedule Booking" visible={visible}>
      {/* Current Date Display */}
      <View style={styles.currentDateContainer}>
        <Text style={styles.currentDateLabel}>Current Date & Time:</Text>
        <Text style={styles.currentDateText}>
          {formatDate(currentDate)} at {formatTime(currentDate)}
        </Text>
      </View>

      {/* New Date Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>New Date</Text>
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
          <Ionicons color={colors.primary[500]} name="calendar-outline" size={20} />
          <Text style={styles.pickerButtonText}>{formatDate(date)}</Text>
          <Ionicons color={semanticColors.text.placeholder} name="chevron-down" size={20} />
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            mode="date"
            onChange={handleDateChange}
            themeVariant="light"
            value={date}
          />
        )}
      </View>

      {/* New Time Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>New Time</Text>
        <Pressable onPress={() => setShowTimePicker(true)} style={styles.pickerButton}>
          <Ionicons color={colors.primary[500]} name="time-outline" size={20} />
          <Text style={styles.pickerButtonText}>{formatTime(date)}</Text>
          <Ionicons color={semanticColors.text.placeholder} name="chevron-down" size={20} />
        </Pressable>
        {showTimePicker && (
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            mode="time"
            onChange={handleTimeChange}
            themeVariant="light"
            value={date}
          />
        )}
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Ionicons
          color={semanticColors.text.secondary}
          name="information-circle-outline"
          size={20}
        />
        <Text style={styles.infoText}>
          Rescheduling is subject to professional availability. You may be charged a rescheduling
          fee.
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        disabled={isSubmitting}
        fullWidth
        loading={isSubmitting}
        onPress={handleSubmit}
        size="lg"
        variant="primary"
      >
        Confirm Reschedule
      </Button>
    </Modal>
  );
}

const styles = StyleSheet.create({
  currentDateContainer: {
    padding: spacing.lg,
    backgroundColor: semanticColors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
  },
  currentDateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: semanticColors.text.secondary,
    marginBottom: spacing.xs,
  },
  currentDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  pickerContainer: {
    marginBottom: spacing.xl,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: semanticColors.text.primary,
    marginBottom: spacing.md,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: semanticColors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: semanticColors.text.primary,
  },
  infoContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xxl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: semanticColors.text.secondary,
  },
});
