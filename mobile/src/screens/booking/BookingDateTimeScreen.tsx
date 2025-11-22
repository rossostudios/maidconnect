import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Colors } from "@/constants/colors";
import { getProfessionalAvailability } from "@/lib/api/bookings";
import type { TimeSlot } from "@/types/api/booking";
import type { MainTabScreenProps } from "@/types/navigation";

type Props = MainTabScreenProps<"BookingDateTime">;

export function BookingDateTimeScreen({ route, navigation }: Props) {
  const { professionalId, serviceType, durationHours } = route.params;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const availability = await getProfessionalAvailability(professionalId, dateStr);
      setTimeSlots(availability.slots);
    } catch (error) {
      console.error("Error loading availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleContinue = () => {
    if (!selectedTime) return;

    navigation.navigate("BookingAddress", {
      professionalId,
      serviceType,
      durationHours,
      startTime: selectedTime,
    });
  };

  // Generate next 30 days
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const nextDays = getNextDays();

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={Colors.text.primary} name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fecha y Hora</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona la fecha</Text>

          {Platform.OS === "ios" ? (
            <DateTimePicker
              display="inline"
              locale="es-ES"
              minimumDate={new Date()}
              mode="date"
              onChange={handleDateChange}
              style={styles.iosDatePicker}
              value={selectedDate}
            />
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.datesScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {nextDays.map((date, index) => {
                  const isSelected =
                    format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                  const dayName = format(date, "EEE", { locale: es });
                  const dayNumber = format(date, "d");
                  const monthName = format(date, "MMM", { locale: es });

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      key={index}
                      onPress={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                    >
                      <View style={[styles.dateCard, isSelected && styles.dateCardSelected]}>
                        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                          {dayName}
                        </Text>
                        <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                          {dayNumber}
                        </Text>
                        <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
                          {monthName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {showDatePicker && (
                <DateTimePicker
                  display="default"
                  minimumDate={new Date()}
                  mode="date"
                  onChange={handleDateChange}
                  value={selectedDate}
                />
              )}
            </>
          )}
        </Card>

        {/* Time Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona la hora</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.orange[500]} size="large" />
            </View>
          ) : (
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.start;
                const timeStr = format(new Date(slot.start), "h:mm a");

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={!slot.available}
                    key={index}
                    onPress={() => slot.available && setSelectedTime(slot.start)}
                  >
                    <View
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                        !slot.available && styles.timeSlotDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                          !slot.available && styles.timeSlotTextDisabled,
                        ]}
                      >
                        {timeStr}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons color={Colors.blue[500]} name="information-circle-outline" size={20} />
          </View>
          <Text style={styles.infoText}>
            Los horarios mostrados son estimados. El profesional confirmará la disponibilidad final.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          disabled={!selectedTime}
          onPress={handleContinue}
          size="lg"
          title="Continuar"
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  iosDatePicker: {
    width: "100%",
  },
  datesScroll: {
    gap: 12,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  dateCardSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  dayName: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.secondary,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  dayNameSelected: {
    color: Colors.orange[600],
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: Colors.orange[600],
  },
  monthName: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.text.tertiary,
    textTransform: "capitalize",
  },
  monthNameSelected: {
    color: Colors.orange[500],
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
    minWidth: 90,
    alignItems: "center",
  },
  timeSlotSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  timeSlotDisabled: {
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  timeSlotTextSelected: {
    color: Colors.orange[600],
  },
  timeSlotTextDisabled: {
    color: Colors.neutral[400],
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.blue[50],
    borderWidth: 1,
    borderColor: Colors.blue[200],
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
