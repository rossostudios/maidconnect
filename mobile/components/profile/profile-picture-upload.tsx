/**
 * Profile Picture Upload Component
 * Allows users to select and upload profile pictures using Expo Image Picker
 */

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";

type ProfilePictureUploadProps = {
  currentImageUrl?: string | null;
  userId: string;
  onUploadComplete?: (url: string) => void;
};

export function ProfilePictureUpload({
  currentImageUrl,
  userId,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [imageUri, setImageUri] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to upload your profile picture."
      );
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        await uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      Alert.alert("Permission Required", "We need camera permissions to take your photo.");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        await uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);

    try {
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique file name
      const fileExt = uri.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setImageUri(publicUrl);
      onUploadComplete?.(publicUrl);

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Pressable disabled={isUploading} onPress={showImageOptions} style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons color="#94A3B8" name="person" size={48} />
          </View>
        )}

        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#FFFFFF" size="large" />
          </View>
        )}

        <View style={styles.editBadge}>
          <Ionicons color="#FFFFFF" name="camera" size={16} />
        </View>
      </View>

      <Text style={styles.helperText}>Tap to change profile picture</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: 120,
    height: 120,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
