/**
 * Review Form Component
 * Allows customers to rate and review a completed booking
 */

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ReviewFormProps = {
  visible: boolean;
  professionalName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
};

export function ReviewForm({ visible, professionalName, onClose, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(rating, comment.trim());
      setRating(0);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={handleClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons color="#64748B" name="close" size={24} />
            </Pressable>
          </View>

          {/* Professional Name */}
          <Text style={styles.professionalName}>with {professionalName}</Text>

          {/* Star Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>How was your experience?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Ionicons
                    color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                  />
                </Pressable>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </Text>
            )}
          </View>

          {/* Comment */}
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Share your experience (optional)</Text>
            <TextInput
              maxLength={500}
              multiline
              onChangeText={setComment}
              placeholder="Tell us about your experience..."
              placeholderTextColor="#94A3B8"
              style={styles.commentInput}
              textAlignVertical="top"
              value={comment}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          {/* Submit Button */}
          <Pressable
            disabled={rating === 0 || isSubmitting}
            onPress={handleSubmit}
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  professionalName: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  commentInput: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
  },
  characterCount: {
    marginTop: 8,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
  },
  submitButton: {
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
