import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchConversations } from "@/features/messaging/api";
import type { Conversation } from "@/features/messaging/types";
import { useRealtimeConversations } from "@/features/messaging/use-realtime-conversations";
import { useAuth } from "@/providers/AuthProvider";

export default function MessagesScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const { data, error, isLoading, isRefetching, refetch } = useQuery<Conversation[], Error>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  // Subscribe to realtime conversation updates
  useRealtimeConversations(session?.user?.id || null);

  const conversations = data ?? [];
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationCard conversation={item} onPress={handleConversationPress} />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSubtitle}>{totalUnread} unread messages</Text>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons color="#DC2626" name="alert-circle-outline" size={20} />
          <Text style={styles.errorText}>Unable to load messages. Pull to refresh.</Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={conversations}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons color="#CBD5E1" name="chatbubbles-outline" size={64} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
              Start a conversation with a professional from their profile or booking details.
            </Text>
          </View>
        }
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        renderItem={renderConversation}
      />
    </SafeAreaView>
  );
}

function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: (id: string) => void;
}) {
  const handlePress = () => onPress(conversation.id);

  const formattedTime = conversation.lastMessageAt
    ? formatMessageTime(conversation.lastMessageAt)
    : "";

  return (
    <Pressable onPress={handlePress} style={styles.conversationCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {conversation.otherParticipantName?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text numberOfLines={1} style={styles.participantName}>
            {conversation.otherParticipantName || "Unknown User"}
          </Text>
          {formattedTime && <Text style={styles.timestamp}>{formattedTime}</Text>}
        </View>

        <View style={styles.messageRow}>
          <Text
            numberOfLines={2}
            style={[styles.lastMessage, conversation.unreadCount > 0 && styles.lastMessageUnread]}
          >
            {conversation.lastMessage || "No messages yet"}
          </Text>
        </View>
      </View>

      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
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
    paddingVertical: 8,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  participantName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 13,
    color: "#64748B",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: "#64748B",
    flex: 1,
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontWeight: "600",
    color: "#0F172A",
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginLeft: 12,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 92,
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
});
