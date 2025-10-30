"use client";

import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationSkeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";

export type Conversation = {
  id: string;
  booking_id: string;
  customer_id: string;
  professional_id: string;
  last_message_at: string | null;
  customer_unread_count: number;
  professional_unread_count: number;
  created_at: string;
  booking: {
    id: string;
    service_name: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
  };
  customer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  professional: {
    profile_id: string;
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  };
};

type NormalizedUser = {
  id: string;
  full_name: string;
  avatar_url?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
};

type Props = {
  userId: string;
  userRole: "customer" | "professional";
};

// Helper to normalize user data from conversation
function normalizeUser(
  conversation: Conversation,
  userRole: "customer" | "professional"
): NormalizedUser {
  if (userRole === "customer") {
    // Customer wants to see professional
    return {
      id: conversation.professional.profile_id,
      full_name: conversation.professional.profile.full_name,
      avatar_url: conversation.professional.profile.avatar_url,
    };
  } else {
    // Professional wants to see customer
    return conversation.customer;
  }
}

export function MessagingInterface({ userId, userRole }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  const { permission, supported, requestPermission, showNotification } = useNotifications();

  // Request notification permission on mount
  useEffect(() => {
    if (supported && permission === "default") {
      // Auto-request permission after a short delay
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [supported, permission, requestPermission]);

  // Callbacks for real-time updates
  const handleNewMessage = useCallback(
    async (message: any) => {
      if (selectedConversation && message.conversation_id === selectedConversation.id) {
        // Fetch updated messages to get full message with sender info
        await fetchMessages(selectedConversation.id);
      }
      // Always refresh conversations to update unread counts
      await fetchConversations();
    },
    [selectedConversation?.id]
  );

  const handleConversationUpdate = useCallback(async () => {
    await fetchConversations();
  }, []);

  // Subscribe to real-time updates
  useRealtimeMessages({
    userId,
    userRole,
    selectedConversationId: selectedConversation?.id,
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
  });

  // Fetch conversations on mount (no polling)
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected (no polling)
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversation) {
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, messages.length]);

  // Monitor for new messages and show notifications
  useEffect(() => {
    const currentUnreadCount = conversations.reduce((sum, conv) => {
      return (
        sum +
        (userRole === "customer" ? conv.customer_unread_count : conv.professional_unread_count)
      );
    }, 0);

    // If unread count increased and we're not looking at messages
    if (currentUnreadCount > previousUnreadCount && !document.hasFocus()) {
      const newMessages = currentUnreadCount - previousUnreadCount;
      const latestConversation = conversations.find((conv) => {
        const count =
          userRole === "customer" ? conv.customer_unread_count : conv.professional_unread_count;
        return count > 0;
      });

      if (latestConversation) {
        const sender = normalizeUser(latestConversation, userRole);
        showNotification(`New message from ${sender.full_name}`, {
          body: `You have ${newMessages} unread message${newMessages > 1 ? "s" : ""}`,
          tag: "new-message",
        });
      }
    }

    setPreviousUnreadCount(currentUnreadCount);
  }, [conversations, userRole, previousUnreadCount, showNotification]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: "POST",
      });
      // Update unread count locally
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                customer_unread_count: userRole === "customer" ? 0 : conv.customer_unread_count,
                professional_unread_count:
                  userRole === "professional" ? 0 : conv.professional_unread_count,
              }
            : conv
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!selectedConversation || !messageText.trim()) return;

    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Real-time subscription will handle the update automatically
      // No need to manually fetch - the message will appear via Supabase Realtime
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return <ConversationSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] overflow-hidden rounded-2xl border border-[#ebe5d8] bg-white shadow-sm">
      {/* Conversations List */}
      <div className="w-96 flex-shrink-0 border-r border-[#ebe5d8] overflow-y-auto">
        <div className="border-b border-[#ebe5d8] bg-white px-6 py-5">
          <h2 className="text-xl font-semibold text-[#211f1a]">Conversations</h2>
          <p className="mt-1 text-sm text-[#7d7566]">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>

        {/* Search and filter */}
        <div className="border-b border-[#ebe5d8] bg-white px-6 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-[#ebe5d8] px-4 py-2 pl-10 text-sm text-[#211f1a] placeholder-[#7d7566] focus:border-[#ff5d46] focus:outline-none focus:ring-1 focus:ring-[#ff5d46]"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-[#7d7566]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto max-w-xs">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe5d8]">
                  <svg
                    className="h-6 w-6 text-[#7d7566]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-[#211f1a]">No conversations</h3>
              <p className="mt-1 text-sm text-[#5d574b]">
                Messages will appear when you book a service
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ebe5d8]">
            {conversations.map((conv) => {
              const otherUser = normalizeUser(conv, userRole);
              const unreadCount =
                userRole === "customer"
                  ? conv.customer_unread_count
                  : conv.professional_unread_count;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-6 text-left transition hover:bg-[#ff5d46]/5 ${
                    selectedConversation?.id === conv.id ? "bg-[#ff5d46]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt={otherUser.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46] text-base font-semibold text-white">
                          {otherUser.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-base font-semibold text-[#211f1a]">
                          {otherUser.full_name}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#ff5d46] px-2 text-xs font-semibold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-[#5d574b]">{conv.booking.service_name}</p>
                      {conv.last_message_at && (
                        <p className="mt-2 text-sm text-[#7d7566]">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Thread */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-[#ebe5d8] bg-white px-8 py-5">
              {(() => {
                const otherUser = normalizeUser(selectedConversation, userRole);
                return (
                  <div className="flex items-center gap-4">
                    {otherUser.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46] text-base font-semibold text-white">
                        {otherUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-[#211f1a]">
                        {otherUser.full_name}
                      </h3>
                      <p className="text-sm text-[#7d7566]">
                        {selectedConversation.booking.service_name} •{" "}
                        {new Date(
                          selectedConversation.booking.scheduled_start
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-[#7d7566] transition hover:bg-[#ebe5d8]">
                View Booking
              </button>
            </div>

            {/* Messages */}
            <MessageThread messages={messages} currentUserId={userId} loading={messagesLoading} />

            {/* Message Input */}
            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="max-w-sm text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
                  <svg
                    className="h-8 w-8 text-[#7d7566]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#211f1a]">Select a conversation</h3>
              <p className="mt-2 text-base text-[#5d574b]">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageThread({
  messages,
  currentUserId,
  loading,
}: {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-base text-[#5d574b]">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-base text-[#5d574b]">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isCurrentUser ? "bg-[#ff5d46] text-white" : "bg-[#ebe5d8] text-[#211f1a]"
                }`}
              >
                <p className="text-base leading-relaxed">{msg.message}</p>
                <p className={`mt-2 text-sm ${isCurrentUser ? "text-white/70" : "text-[#7d7566]"}`}>
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSend(message);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#ebe5d8] bg-white p-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="rounded-full bg-[#ff5d46] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
