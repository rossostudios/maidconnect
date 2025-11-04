import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "@/lib/supabase";
import {
  fetchMessages,
  sendMessage,
  markConversationAsRead,
} from "@/features/messaging/api";
import type { Message } from "@/features/messaging/types";

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id || null);
    });
  }, []);

  // Fetch messages
  const { data, error, isLoading } = useQuery<Message[], Error>({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const messages = data ?? [];

  // Mark as read when screen opens
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId).catch((err) =>
        console.error("Failed to mark as read:", err)
      );
    }
  }, [conversationId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Refetch messages when new message arrives
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        conversationId: conversationId!,
        content,
      }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error: Error) => {
      console.error("Failed to send message:", error);
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(messageText.trim());
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && item.senderName && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load messages</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backIconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {messages.length > 0
              ? messages.find((m) => m.senderId !== currentUserId)?.senderName || "Chat"
              : "Chat"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyDescription}>
                Start the conversation by sending a message below.
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
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
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "75%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#F1F5F9",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#0F172A",
  },
  messageTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    marginLeft: 12,
  },
  ownMessageTime: {
    marginLeft: 0,
    marginRight: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
    paddingHorizontal: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
});
