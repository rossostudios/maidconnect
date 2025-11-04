import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  formatAddressCompact,
} from "@/features/addresses/api";
import type { Address, CreateAddressParams } from "@/features/addresses/types";

type AddressFormData = {
  label: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  apartmentUnit: string;
  accessInstructions: string;
  isDefault: boolean;
};

export default function AddressesScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data, error, isLoading, isRefetching, refetch } = useQuery<Address[], Error>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const addresses = data ?? [];

  const handleAddNew = () => {
    setEditingAddress(null);
    setModalVisible(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingAddress(null);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <AddressCard
      address={item}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDeleteConfirm(item)}
      onSetDefault={() => handleSetDefault(item.id)}
    />
  );

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      Alert.alert("Success", "Address deleted successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to delete address");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to set default address");
    },
  });

  const handleDeleteConfirm = (address: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address.label || formatAddressCompact(address)}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(address.id),
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <Pressable style={styles.addButton} onPress={handleAddNew}>
          <Ionicons name="add-circle" size={28} color="#2563EB" />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>Unable to load addresses. Pull to refresh.</Text>
        </View>
      )}

      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyDescription}>
              Add your first address to make booking faster and easier.
            </Text>
            <Pressable style={styles.emptyButton} onPress={handleAddNew}>
              <Text style={styles.emptyButtonText}>Add Address</Text>
            </Pressable>
          </View>
        }
      />

      <AddressFormModal
        visible={modalVisible}
        address={editingAddress}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          refetch();
        }}
      />
    </SafeAreaView>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleRow}>
          {address.label && <Text style={styles.addressLabel}>{address.label}</Text>}
          {address.isDefault && <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>}
        </View>
        <View style={styles.addressActions}>
          <Pressable style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="pencil" size={20} color="#2563EB" />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.streetAddress}>{address.streetAddress}</Text>
      {address.apartmentUnit && (
        <Text style={styles.addressDetail}>Unit {address.apartmentUnit}</Text>
      )}
      {address.neighborhood && <Text style={styles.addressDetail}>{address.neighborhood}</Text>}
      <Text style={styles.addressDetail}>
        {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
      </Text>
      <Text style={styles.addressDetail}>{address.country}</Text>

      {address.accessInstructions && (
        <View style={styles.instructionsBox}>
          <Ionicons name="information-circle-outline" size={16} color="#64748B" />
          <Text style={styles.instructionsText}>{address.accessInstructions}</Text>
        </View>
      )}

      {!address.isDefault && (
        <Pressable style={styles.setDefaultButton} onPress={onSetDefault}>
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </Pressable>
      )}
    </View>
  );
}

function AddressFormModal({
  visible,
  address,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  address: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!address;

  const [formData, setFormData] = useState<AddressFormData>({
    label: address?.label || "",
    streetAddress: address?.streetAddress || "",
    neighborhood: address?.neighborhood || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "Colombia",
    apartmentUnit: address?.apartmentUnit || "",
    accessInstructions: address?.accessInstructions || "",
    isDefault: address?.isDefault || false,
  });

  const createMutation = useMutation({
    mutationFn: (params: CreateAddressParams) => createAddress(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      Alert.alert("Success", "Address added successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to add address");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: CreateAddressParams & { id: string }) => updateAddress(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      Alert.alert("Success", "Address updated successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to update address");
    },
  });

  const handleSubmit = () => {
    if (!formData.streetAddress.trim() || !formData.city.trim() || !formData.country.trim()) {
      Alert.alert("Validation Error", "Please fill in required fields: Street Address, City, and Country");
      return;
    }

    const params: CreateAddressParams = {
      label: formData.label.trim() || undefined,
      streetAddress: formData.streetAddress.trim(),
      neighborhood: formData.neighborhood.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      country: formData.country.trim(),
      apartmentUnit: formData.apartmentUnit.trim() || undefined,
      accessInstructions: formData.accessInstructions.trim() || undefined,
      isDefault: formData.isDefault,
    };

    if (isEditing && address) {
      updateMutation.mutate({ ...params, id: address.id });
    } else {
      createMutation.mutate(params);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>{isEditing ? "Edit Address" : "Add Address"}</Text>
          <Pressable onPress={handleSubmit} disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color="#2563EB" size="small" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          <Text style={styles.inputLabel}>Label (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Home, Office, etc."
            value={formData.label}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, label: text }))}
          />

          <Text style={styles.inputLabel}>Street Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street"
            value={formData.streetAddress}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, streetAddress: text }))}
          />

          <Text style={styles.inputLabel}>Apartment/Unit (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Apt 4B"
            value={formData.apartmentUnit}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, apartmentUnit: text }))}
          />

          <Text style={styles.inputLabel}>Neighborhood (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Neighborhood"
            value={formData.neighborhood}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, neighborhood: text }))}
          />

          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Medellín"
            value={formData.city}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
          />

          <Text style={styles.inputLabel}>State/Province (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Antioquia"
            value={formData.state}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, state: text }))}
          />

          <Text style={styles.inputLabel}>Postal Code (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="050001"
            value={formData.postalCode}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, postalCode: text }))}
            keyboardType="number-pad"
          />

          <Text style={styles.inputLabel}>Country *</Text>
          <TextInput
            style={styles.input}
            placeholder="Colombia"
            value={formData.country}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, country: text }))}
          />

          <Text style={styles.inputLabel}>Access Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Gate code, parking info, etc."
            value={formData.accessInstructions}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, accessInstructions: text }))}
            multiline
            numberOfLines={3}
          />

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setFormData((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
          >
            <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
              {formData.isDefault && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  addButton: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEE2E2",
    borderBottomWidth: 1,
    borderBottomColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  streetAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 2,
  },
  instructionsBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#64748B",
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  cancelText: {
    fontSize: 16,
    color: "#64748B",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#0F172A",
  },
});
