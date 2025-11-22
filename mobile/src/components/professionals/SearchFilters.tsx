import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/Card";
import { Colors } from "@/constants/colors";
import type { ProfessionalSearchParams } from "@/types/api/professional";

interface SearchFiltersProps {
  filters: ProfessionalSearchParams;
  onFilterChange: (filters: ProfessionalSearchParams) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const services = [
    { id: "cleaning", label: "Limpieza", icon: "sparkles-outline" as const },
    { id: "plumbing", label: "Plomería", icon: "water-outline" as const },
    { id: "electrical", label: "Electricidad", icon: "flash-outline" as const },
    { id: "gardening", label: "Jardinería", icon: "leaf-outline" as const },
    { id: "painting", label: "Pintura", icon: "brush-outline" as const },
    { id: "carpentry", label: "Carpintería", icon: "hammer-outline" as const },
  ];

  const ratings = [
    { value: 4.5, label: "4.5+" },
    { value: 4.0, label: "4.0+" },
    { value: 3.5, label: "3.5+" },
  ];

  const toggleService = (serviceId: string) => {
    onFilterChange({
      ...filters,
      service: filters.service === serviceId ? undefined : serviceId,
    });
  };

  const toggleRating = (rating: number) => {
    onFilterChange({
      ...filters,
      min_rating: filters.min_rating === rating ? undefined : rating,
    });
  };

  const toggleVerified = () => {
    onFilterChange({
      ...filters,
      verified_only: !filters.verified_only,
    });
  };

  const hasActiveFilters = filters.service || filters.min_rating || filters.verified_only;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtros</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Servicios</Text>
        <ScrollView
          contentContainerStyle={styles.servicesScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {services.map((service) => {
            const isActive = filters.service === service.id;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={service.id}
                onPress={() => toggleService(service.id)}
              >
                <View style={[styles.serviceChip, isActive && styles.serviceChipActive]}>
                  <Ionicons
                    color={isActive ? Colors.white : Colors.text.secondary}
                    name={service.icon}
                    size={16}
                  />
                  <Text style={[styles.serviceLabel, isActive && styles.serviceLabelActive]}>
                    {service.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Calificación Mínima</Text>
        <View style={styles.ratingRow}>
          {ratings.map((rating) => {
            const isActive = filters.min_rating === rating.value;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={rating.value}
                onPress={() => toggleRating(rating.value)}
                style={styles.ratingChipContainer}
              >
                <View style={[styles.ratingChip, isActive && styles.ratingChipActive]}>
                  <Ionicons
                    color={isActive ? Colors.white : Colors.orange[500]}
                    name="star"
                    size={14}
                  />
                  <Text style={[styles.ratingLabel, isActive && styles.ratingLabelActive]}>
                    {rating.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Verified Only */}
      <TouchableOpacity activeOpacity={0.7} onPress={toggleVerified} style={styles.verifiedRow}>
        <View style={styles.verifiedLeft}>
          <Ionicons
            color={filters.verified_only ? Colors.blue[500] : Colors.neutral[400]}
            name="checkmark-circle"
            size={20}
          />
          <Text style={styles.verifiedLabel}>Solo verificados</Text>
        </View>
        <View style={[styles.toggle, filters.verified_only && styles.toggleActive]}>
          <View style={[styles.toggleThumb, filters.verified_only && styles.toggleThumbActive]} />
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.orange[600],
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  servicesScroll: {
    gap: 8,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 1,
    borderColor: "transparent",
  },
  serviceChipActive: {
    backgroundColor: Colors.orange[500],
    borderColor: Colors.orange[600],
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  serviceLabelActive: {
    color: Colors.white,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
  },
  ratingChipContainer: {
    flex: 1,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    backgroundColor: Colors.orange[50],
    borderRadius: 12, // Anthropic rounded-lg
    borderWidth: 1,
    borderColor: Colors.orange[200],
  },
  ratingChipActive: {
    backgroundColor: Colors.orange[500],
    borderColor: Colors.orange[600],
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.orange[600],
  },
  ratingLabelActive: {
    color: Colors.white,
  },
  verifiedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  verifiedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14, // rounded-full
    backgroundColor: Colors.neutral[300],
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: Colors.orange[500],
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12, // rounded-full
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
});
