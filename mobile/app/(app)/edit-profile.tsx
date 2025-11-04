import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/features/profile/api";
import type { UpdateProfileParams } from "@/features/profile/types";

type FormData = {
  fullName: string;
  phone: string;
  city: string;
  country: string;
};

export default function EditProfileScreen() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    city: "",
    country: "",
  });
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [photoDeleted, setPhotoDeleted] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (params: UpdateProfileParams & { photoUri?: string }) => {
      // Upload photo first if there's a new one
      if (params.photoUri) {
        await uploadProfilePhoto(params.photoUri);
      }

      // Delete photo if requested
      if (photoDeleted && !params.photoUri) {
        await deleteProfilePhoto();
      }

      // Update profile data
      const { photoUri, ...profileParams } = params;
      return updateProfile(profileParams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to update profile");
    },
  });

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
      setPhotoDeleted(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera permissions to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
      setPhotoDeleted(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert("Remove Photo", "Are you sure you want to remove your profile photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setNewPhotoUri(null);
          setPhotoDeleted(true);
        },
      },
    ]);
  };

  const handlePhotoOptions = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      ...(profile?.avatarUrl || newPhotoUri
        ? [{ text: "Remove Photo", onPress: handleRemovePhoto, style: "destructive" as const }]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return;
    }

    const params: UpdateProfileParams & { photoUri?: string } = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim() || undefined,
      city: formData.city.trim() || undefined,
      country: formData.country.trim() || undefined,
    };

    if (newPhotoUri) {
      params.photoUri = newPhotoUri;
    }

    updateMutation.mutate(params);
  };

  const handleCancel = () => {
    if (updateMutation.isPending) {
      return;
    }
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPhotoUri = newPhotoUri || (photoDeleted ? null : profile?.avatarUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel} disabled={updateMutation.isPending}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator color="#2563EB" size="small" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.photoSection}>
          <Pressable style={styles.photoContainer} onPress={handlePhotoOptions}>
            {currentPhotoUri ? (
              <Image source={{ uri: currentPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={48} color="#94A3B8" />
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile?.email || ""}
              editable={false}
            />
            <Text style={styles.inputHint}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, fullName: text }))}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+57 300 123 4567"
              value={formData.phone}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Medellín"
              value={formData.city}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Colombia"
              value={formData.country}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, country: text }))}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E2E8F0",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  photoEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  photoHint: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
  },
  inputDisabled: {
    backgroundColor: "#F8FAFC",
    color: "#94A3B8",
  },
  inputHint: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
