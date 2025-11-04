"use client";

import { formatDistanceToNow } from "date-fns";
import { Languages } from "lucide-react";
import Image from "next/image";
import {
  useActionState,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { ConversationSkeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useMessageTranslation } from "@/hooks/use-message-translation";
import { useMessages } from "@/hooks/use-messages";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import {
  getConversationUnreadCount,
  getTotalUnreadCount,
  normalizeUser,
  updateConversationUnreadCount,
} from "@/lib/messaging-utils";
import { toast } from "@/lib/toast";
import type { SupportedLanguage } from "@/lib/translation";

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

// type NormalizedUser = {
//   id: string;
//   full_name: string;
//   avatar_url?: string;
// };

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

export function MessagingInterface({ userId, userRole }: Props) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Custom hooks for cleaner state management
  const {
    conversations,
    setConversations,
    loading,
    error,
    refetch: refetchConversations,
  } = useConversations();

  const {
    messages,
    setMessages: _setMessages,
    loading: messagesLoading,
  } = useMessages(selectedConversation?.id || null);

  // Week 5-6: Auto-translate feature
  const autoTranslateEnabled = useFeatureFlag("auto_translate_chat");
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("en");

  // React 19: useOptimistic for instant message display
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );

  const { permission, supported, requestPermission, showNotification } = useNotifications();

  // Mark conversation as read and update state
  const _markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        await fetch(`/api/messages/conversations/${conversationId}/read`, {
          method: "POST",
        });
        // Update unread count locally
        setConversations((prev) =>
          updateConversationUnreadCount(prev, conversationId, userRole, 0)
        );
      } catch (_err) {
        // Silent fail - non-critical
      }
    },
    [setConversations, userRole]
  );

  // Request notification permission on mount
  useEffect(() => {
    if (supported && permission === "default") {
      // Auto-request permission after a short delay
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
    return;
  }, [supported, permission, requestPermission]);

  // Callbacks for real-time updates - simplified with custom hooks
  const handleNewMessage = useCallback(async () => {
    await refetchConversations();
  }, [refetchConversations]);

  const handleConversationUpdate = useCallback(async () => {
    await refetchConversations();
  }, [refetchConversations]);

  // Subscribe to real-time updates
  useRealtimeMessages({
    userId,
    userRole,
    selectedConversationId: selectedConversation?.id,
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
  });

  // Monitor for new messages and show notifications - simplified with utility
  useEffect(() => {
    const currentUnreadCount = getTotalUnreadCount(conversations, userRole);

    // If unread count increased and we're not looking at messages
    if (currentUnreadCount > previousUnreadCount && !document.hasFocus()) {
      const newMessages = currentUnreadCount - previousUnreadCount;
      const latestConversation = conversations.find(
        (conv) => getConversationUnreadCount(conv, userRole) > 0
      );

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

  const sendMessage = async (messageText: string) => {
    if (!(selectedConversation && messageText.trim())) {
      return;
    }

    // React 19: Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: userId,
      message: messageText,
      attachments: [],
      read_at: null,
      created_at: new Date().toISOString(),
      sender: {
        id: userId,
        full_name: "You",
        avatar_url: undefined,
      },
    };

    // React 19: Add message optimistically
    addOptimisticMessage(optimisticMessage);

    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Real-time subscription will handle the update automatically
      // No need to manually fetch - the message will appear via Supabase Realtime
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
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
      <div className="w-96 flex-shrink-0 overflow-y-auto border-[#ebe5d8] border-r">
        <div className="border-[#ebe5d8] border-b bg-white px-6 py-5">
          <h2 className="font-semibold text-[#211f1a] text-xl">Conversations</h2>
          <p className="mt-1 text-[#7d7566] text-sm">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>

        {/* Search and filter */}
        <div className="border-[#ebe5d8] border-b bg-white px-6 py-4">
          <div className="relative">
            <input
              className="w-full rounded-lg border border-[#ebe5d8] px-4 py-2 pl-10 text-[#211f1a] text-sm placeholder-[#7d7566] focus:border-[#8B7355] focus:outline-none focus:ring-1 focus:ring-[#8B7355]"
              placeholder="Search conversations..."
              type="text"
            />
            <svg
              aria-hidden="true"
              className="absolute top-2.5 left-3 h-5 w-5 text-[#7d7566]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
                    aria-hidden="true"
                    className="h-6 w-6 text-[#7d7566]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#211f1a] text-base">No conversations</h3>
              <p className="mt-1 text-[#5d574b] text-sm">
                Messages will appear when you book a service
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ebe5d8]">
            {conversations.map((conv) => {
              const otherUser = normalizeUser(conv, userRole);
              const unreadCount = getConversationUnreadCount(conv, userRole);

              return (
                <button
                  className={`w-full p-6 text-left transition hover:bg-[#8B7355]/5 ${
                    selectedConversation?.id === conv.id ? "bg-[#8B7355]/5" : ""
                  }`}
                  key={conv.id}
                  onClick={() => {
                    // React 19: Use useTransition for smooth UI updates
                    startTransition(() => {
                      setSelectedConversation(conv);
                    });
                  }}
                  type="button"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser.avatar_url ? (
                        <Image
                          alt={otherUser.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                          height={48}
                          loading="lazy"
                          src={otherUser.avatar_url}
                          width={48}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B7355] font-semibold text-base text-white">
                          {otherUser.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-semibold text-[#211f1a] text-base">
                          {otherUser.full_name}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#8B7355] px-2 font-semibold text-white text-xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[#5d574b] text-sm">{conv.booking.service_name}</p>
                      {conv.last_message_at && (
                        <p className="mt-2 text-[#7d7566] text-sm">
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
            <div className="flex items-center justify-between border-[#ebe5d8] border-b bg-white px-8 py-5">
              {(() => {
                const otherUser = normalizeUser(selectedConversation, userRole);
                return (
                  <div className="flex items-center gap-4">
                    {otherUser.avatar_url ? (
                      <Image
                        alt={otherUser.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                        height={48}
                        loading="lazy"
                        src={otherUser.avatar_url}
                        width={48}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B7355] font-semibold text-base text-white">
                        {otherUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[#211f1a] text-lg">
                        {otherUser.full_name}
                      </h3>
                      <p className="text-[#7d7566] text-sm">
                        {selectedConversation.booking.service_name} •{" "}
                        {new Date(
                          selectedConversation.booking.scheduled_start
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center gap-2">
                {autoTranslateEnabled && (
                  <div className="flex items-center gap-2">
                    <button
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition ${
                        translationEnabled
                          ? "bg-[#8B7355] text-white hover:bg-[#9B8B7E]"
                          : "text-[#7d7566] hover:bg-[#ebe5d8]"
                      }`}
                      onClick={() => setTranslationEnabled(!translationEnabled)}
                      type="button"
                    >
                      <Languages className="h-4 w-4" />
                      {translationEnabled ? "Translation On" : "Translate"}
                    </button>
                    {translationEnabled && (
                      <select
                        className="rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-1 focus:ring-[#8B7355]"
                        onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                        value={targetLanguage}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    )}
                  </div>
                )}
                <button
                  className="rounded-lg px-4 py-2 font-medium text-[#7d7566] text-sm transition hover:bg-[#ebe5d8]"
                  type="button"
                >
                  View Booking
                </button>
              </div>
            </div>

            {/* Messages */}
            <MessageThread
              currentUserId={userId}
              loading={messagesLoading}
              messages={optimisticMessages}
              targetLanguage={targetLanguage}
              translationEnabled={translationEnabled}
            />

            {/* Message Input */}
            <MessageInput isPending={isPending} onSend={sendMessage} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="max-w-sm text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
                  <svg
                    aria-hidden="true"
                    className="h-8 w-8 text-[#7d7566]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#211f1a] text-xl">Select a conversation</h3>
              <p className="mt-2 text-[#5d574b] text-base">
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
  translationEnabled,
  targetLanguage,
}: {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  translationEnabled: boolean;
  targetLanguage: SupportedLanguage;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use custom hook for translation logic
  const { translations, translatingIds } = useMessageTranslation(
    messages,
    translationEnabled,
    targetLanguage
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[#5d574b] text-base">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-[#5d574b] text-base">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          const hasTranslation = translationEnabled && translations[msg.id];
          const isTranslating = translationEnabled && translatingIds.has(msg.id);

          return (
            <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`} key={msg.id}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isCurrentUser ? "bg-[#8B7355] text-white" : "bg-[#ebe5d8] text-[#211f1a]"
                }`}
              >
                {hasTranslation ? (
                  <>
                    <p className="text-base leading-relaxed">{translations[msg.id]}</p>
                    <details className="mt-2">
                      <summary
                        className={`cursor-pointer text-xs ${isCurrentUser ? "text-white/70" : "text-[#7d7566]"}`}
                      >
                        Show original
                      </summary>
                      <p
                        className={`mt-1 text-sm ${isCurrentUser ? "text-white/90" : "text-[#211f1a]"}`}
                      >
                        {msg.message}
                      </p>
                    </details>
                  </>
                ) : (
                  <p className="text-base leading-relaxed">{msg.message}</p>
                )}
                {isTranslating && (
                  <p
                    className={`mt-1 text-xs ${isCurrentUser ? "text-white/70" : "text-[#7d7566]"}`}
                  >
                    Translating...
                  </p>
                )}
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

function MessageInput({
  onSend,
  isPending,
}: {
  onSend: (message: string) => void;
  isPending: boolean;
}) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // React 19: useActionState for form submission
  const [_state, formAction, isFormPending] = useActionState(
    async (_prevState: { success: boolean }, formData: FormData) => {
      const messageText = formData.get("message") as string;
      if (messageText?.trim()) {
        await onSend(messageText);
        setMessage("");
        // Focus input after sending
        inputRef.current?.focus();
      }
      return { success: true };
    },
    { success: false }
  );

  const isSending = isFormPending || isPending;

  return (
    <form action={formAction} className="border-[#ebe5d8] border-t bg-white p-6">
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B735533] disabled:opacity-50"
          disabled={isSending}
          name="message"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          ref={inputRef}
          type="text"
          value={message}
        />
        <button
          className="rounded-full bg-[#8B7355] px-6 py-4 font-semibold text-base text-white transition hover:bg-[#9B8B7E] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!message.trim() || isSending}
          type="submit"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
