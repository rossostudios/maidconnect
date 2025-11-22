import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { Input } from "@/components/Input";
import { Colors } from "@/constants/colors";
import type { MainTabScreenProps } from "@/types/navigation";
import { CITIES_BY_COUNTRY, getNeighborhoodsByCity } from "@/types/territories";

type Props = MainTabScreenProps<"BookingAddress">;

export function BookingAddressScreen({ route, navigation }: Props) {
  const { professionalId, serviceType, durationHours, startTime } = route.params;

  const [street, setStreet] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // For now, default to Colombia cities
  const cities = CITIES_BY_COUNTRY.CO;
  const neighborhoods = selectedCity ? getNeighborhoodsByCity(selectedCity) : [];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!street.trim()) {
      newErrors.street = "La dirección es requerida";
    }

    if (!selectedCity) {
      newErrors.city = "La ciudad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    navigation.navigate("BookingConfirm", {
      professionalId,
      serviceType,
      durationHours,
      startTime,
      address: {
        street: street.trim(),
        city: selectedCity,
        neighborhood: selectedNeighborhood || undefined,
        notes: notes.trim() || undefined,
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={Colors.text.primary} name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dirección</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Street Address */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección completa</Text>
            <Input
              error={errors.street}
              label="Calle y número"
              onChangeText={(text) => {
                setStreet(text);
                if (errors.street) {
                  setErrors({ ...errors, street: "" });
                }
              }}
              placeholder="Ej: Carrera 7 #45-67"
              value={street}
            />

            <Input
              label="Notas adicionales (opcional)"
              multiline
              numberOfLines={3}
              onChangeText={setNotes}
              placeholder="Ej: Apartamento 302, Torre B"
              style={styles.notesInput}
              value={notes}
            />
          </Card>

          {/* City Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Ciudad</Text>
            <View style={styles.citiesGrid}>
              {cities.map((city) => {
                const isSelected = selectedCity === city.value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={city.value}
                    onPress={() => {
                      setSelectedCity(city.value);
                      setSelectedNeighborhood(""); // Reset neighborhood
                      if (errors.city) {
                        setErrors({ ...errors, city: "" });
                      }
                    }}
                  >
                    <View style={[styles.cityCard, isSelected && styles.cityCardSelected]}>
                      <Text style={[styles.cityText, isSelected && styles.cityTextSelected]}>
                        {city.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </Card>

          {/* Neighborhood Selection */}
          {selectedCity && neighborhoods.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Barrio (opcional)</Text>
              <ScrollView
                contentContainerStyle={styles.neighborhoodsScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {neighborhoods.map((neighborhood) => {
                  const isSelected = selectedNeighborhood === neighborhood.value;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      key={neighborhood.value}
                      onPress={() => setSelectedNeighborhood(neighborhood.value)}
                    >
                      <View
                        style={[
                          styles.neighborhoodChip,
                          isSelected && styles.neighborhoodChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.neighborhoodText,
                            isSelected && styles.neighborhoodTextSelected,
                          ]}
                        >
                          {neighborhood.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Card>
          )}

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons color={Colors.blue[500]} name="location-outline" size={20} />
            </View>
            <Text style={styles.infoText}>
              El profesional utilizará esta dirección para llegar a tu ubicación en la fecha y hora
              programada.
            </Text>
          </Card>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Button onPress={handleContinue} size="lg" title="Continuar" variant="primary" />
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  citiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cityCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  cityCardSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  cityText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cityTextSelected: {
    color: Colors.orange[600],
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 8,
  },
  neighborhoodsScroll: {
    gap: 8,
  },
  neighborhoodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  neighborhoodChipSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[50],
  },
  neighborhoodText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  neighborhoodTextSelected: {
    color: Colors.orange[600],
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
