"use client";

import { Cancel01Icon, Search01Icon, TranslateIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { QuickReplies } from "@/components/messaging/quick-replies";
import { TypingIndicator } from "@/components/messaging/typing-indicator";
import { Badge } from "@/components/ui/badge";
import { ConversationSkeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useMessageTranslation } from "@/hooks/use-message-translation";
import { useMessages } from "@/hooks/use-messages";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import {
  getConversationUnreadCount,
  getTotalUnreadCount,
  normalizeUser,
} from "@/lib/messaging-utils";
import type { SupportedLanguage } from "@/lib/translation";
import { cn } from "@/lib/utils";

// ============================================================================
// Filter Types
// ============================================================================

type ConversationFilter = "all" | "unread" | "active" | "completed";

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

// Filter option definitions
const CONVERSATION_FILTERS: Array<{ value: ConversationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function MessagingInterface({ userId, userRole }: Props) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>("all");

  // Custom hooks for cleaner state management
  const {
    conversations,
    setConversations: _setConversations,
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

  // Get the other user's name for typing indicator display
  const getOtherUserName = useCallback(() => {
    if (!selectedConversation) {
      return "User";
    }
    if (userRole === "customer") {
      return selectedConversation.professional?.profile?.full_name || "Professional";
    }
    return selectedConversation.customer?.full_name || "Customer";
  }, [selectedConversation, userRole]);

  // Memoize the other user for selected conversation to avoid recalculation in render
  const selectedOtherUser = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }
    return normalizeUser(selectedConversation, userRole);
  }, [selectedConversation, userRole]);

  // Memoize processed conversations with pre-computed user info and unread counts
  const processedConversations = useMemo(
    () =>
      conversations.map((conv) => ({
        ...conv,
        otherUser: normalizeUser(conv, userRole),
        unreadCount: getConversationUnreadCount(conv, userRole),
      })),
    [conversations, userRole]
  );

  // Filter conversations based on search query and filter selection
  const filteredConversations = useMemo(() => {
    return processedConversations.filter((conv) => {
      // Search filter - match user name, booking ID, or service name
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower) {
        const matchesName = conv.otherUser.full_name.toLowerCase().includes(searchLower);
        const matchesBookingId = conv.booking.id.toLowerCase().includes(searchLower);
        const matchesService = conv.booking.service_name.toLowerCase().includes(searchLower);
        if (!(matchesName || matchesBookingId || matchesService)) {
          return false;
        }
      }

      // Status filter
      switch (conversationFilter) {
        case "unread":
          return conv.unreadCount > 0;
        case "active":
          return ["pending", "confirmed", "in_progress"].includes(conv.booking.status);
        case "completed":
          return ["completed", "cancelled"].includes(conv.booking.status);
        default:
          return true;
      }
    });
  }, [processedConversations, searchQuery, conversationFilter]);

  // Count unread for badge
  const unreadCount = useMemo(
    () => processedConversations.filter((c) => c.unreadCount > 0).length,
    [processedConversations]
  );

  // Typing indicator for real-time typing status
  const {
    typingUsers,
    setTyping,
    isOtherUserTyping: _isOtherUserTyping,
  } = useTypingIndicator({
    conversationId: selectedConversation?.id || null,
    userId,
    userName: getOtherUserName(), // This will be current user's name shown to others
    enabled: !!selectedConversation,
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
      <div className="rounded-lg border border-neutral-500/30 bg-neutral-500/10 p-6 text-base text-neutral-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      {/* Conversations List */}
      <div className="w-96 flex-shrink-0 overflow-y-auto border-border border-r">
        <div className="border-border border-b bg-muted/30 px-6 py-5">
          <h2 className={cn("font-semibold text-foreground text-xl", geistSans.className)}>
            Conversations
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {filteredConversations.length === conversations.length
              ? `${conversations.length} ${conversations.length === 1 ? "conversation" : "conversations"}`
              : `${filteredConversations.length} of ${conversations.length} conversations`}
          </p>
        </div>

        {/* Search and filter */}
        <div className="space-y-3 border-border border-b bg-muted/30 px-6 py-4">
          {/* Search Input */}
          <div className="relative">
            <HugeiconsIcon
              className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground"
              icon={Search01Icon}
            />
            <input
              className={cn(
                "h-10 w-full rounded-lg border border-border bg-card py-2 pr-10 pl-10 text-sm",
                "placeholder:text-muted-foreground",
                "focus:border-rausch-300 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                "transition-all",
                geistSans.className
              )}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, service, or booking ID..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CONVERSATION_FILTERS.map((filter) => {
              const isActive = conversationFilter === filter.value;
              const showBadge = filter.value === "unread" && unreadCount > 0;
              return (
                <button
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-xs transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
                    isActive
                      ? "border-rausch-200 bg-rausch-50 text-rausch-700 dark:bg-rausch-900/20 dark:text-rausch-300"
                      : "border-border bg-card text-muted-foreground hover:border-rausch-200 hover:bg-rausch-50/50 dark:hover:bg-rausch-900/10"
                  )}
                  key={filter.value}
                  onClick={() => setConversationFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                  {showBadge && (
                    <Badge
                      className={cn(
                        "ml-0.5",
                        isActive
                          ? "border-rausch-300 bg-rausch-100 text-rausch-800 dark:bg-rausch-900/40 dark:text-rausch-200"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                      size="sm"
                      variant="outline"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto max-w-xs">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6 text-muted-foreground"
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
              <h3 className="font-semibold text-base text-foreground">No conversations</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Messages will appear when you book a service
              </p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto max-w-xs">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon className="h-6 w-6 text-muted-foreground" icon={Search01Icon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-base text-foreground", geistSans.className)}>
                No matches found
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                {searchQuery
                  ? `No conversations matching "${searchQuery}"`
                  : `No ${conversationFilter} conversations`}
              </p>
              <button
                className="mt-4 font-medium text-rausch-600 text-sm hover:text-rausch-700"
                onClick={() => {
                  setSearchQuery("");
                  setConversationFilter("all");
                }}
                type="button"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => (
              <button
                className={`w-full p-6 text-left transition hover:bg-muted/50 ${
                  selectedConversation?.id === conv.id ? "bg-muted/50" : ""
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
                    {conv.otherUser.avatar_url ? (
                      <Image
                        alt={conv.otherUser.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                        height={48}
                        loading="lazy"
                        src={conv.otherUser.avatar_url}
                        width={48}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-semibold text-base text-muted-foreground">
                        {conv.otherUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-semibold text-base text-foreground">
                        {conv.otherUser.full_name}
                      </h3>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rausch-500 px-2 font-semibold text-white text-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-muted-foreground text-sm">
                      Booking #{conv.booking.id.slice(0, 8)}
                    </p>
                    {conv.last_message_at && (
                      <p className="mt-2 text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Thread */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between border-border border-b bg-muted/30 px-8 py-5">
              {selectedOtherUser && (
                <div className="flex items-center gap-4">
                  {selectedOtherUser.avatar_url ? (
                    <Image
                      alt={selectedOtherUser.full_name}
                      className="h-12 w-12 rounded-full object-cover"
                      height={48}
                      loading="lazy"
                      src={selectedOtherUser.avatar_url}
                      width={48}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-semibold text-base text-muted-foreground">
                      {selectedOtherUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {selectedOtherUser.full_name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Booking #{selectedConversation.booking.id.slice(0, 8)} •{" "}
                      {new Date(selectedConversation.booking.scheduled_start).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {autoTranslateEnabled && (
                  <div className="flex items-center gap-2">
                    <button
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition ${
                        translationEnabled
                          ? "bg-rausch-500 text-white hover:bg-rausch-600"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setTranslationEnabled(!translationEnabled)}
                      type="button"
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={TranslateIcon} />
                      {translationEnabled ? "Translation On" : "Translate"}
                    </button>
                    {translationEnabled && (
                      <select
                        className="rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:border-rausch-500 focus:outline-none focus:ring-1 focus:ring-rausch-500"
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
                  className="rounded-lg px-4 py-2 font-medium text-muted-foreground text-sm transition hover:bg-muted"
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
              typingUsers={typingUsers}
            />

            {/* Message Input */}
            <MessageInput
              isPending={isPending}
              onSend={sendMessage}
              onTyping={setTyping}
              userRole={userRole}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="max-w-sm text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <svg
                    aria-hidden="true"
                    className="h-8 w-8 text-muted-foreground"
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
              <h3 className="font-semibold text-foreground text-xl">Select a conversation</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type TypingUser = {
  id: string;
  name: string;
  typingAt: number;
};

function MessageThread({
  messages,
  currentUserId,
  loading,
  translationEnabled,
  targetLanguage,
  typingUsers = [],
}: {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  translationEnabled: boolean;
  targetLanguage: SupportedLanguage;
  typingUsers?: TypingUser[];
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
        <p className="text-base text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-base text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          const hasTranslation = translationEnabled && translations[msg.id];
          const isTranslating = translationEnabled && translatingIds.has(msg.id);

          return (
            <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`} key={msg.id}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  isCurrentUser ? "bg-rausch-500 text-white" : "bg-muted text-foreground"
                }`}
              >
                {hasTranslation ? (
                  <>
                    <p className="text-base leading-relaxed">{translations[msg.id]}</p>
                    <details className="mt-2">
                      <summary
                        className={`cursor-pointer text-xs ${isCurrentUser ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        Show original
                      </summary>
                      <p
                        className={`mt-1 text-sm ${isCurrentUser ? "text-white/90" : "text-foreground"}`}
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
                    className={`mt-1 text-xs ${isCurrentUser ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Translating...
                  </p>
                )}
                <p
                  className={`mt-2 text-sm ${isCurrentUser ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

      <div ref={messagesEndRef} />
    </div>
  );
}

// Contact sharing detection patterns
const CONTACT_PATTERNS = [
  { pattern: /\d{10,}/, name: "phone number" }, // 10+ digit phone numbers
  { pattern: /@[a-zA-Z0-9.-]+\.(com|co|net|org|edu)/i, name: "email" }, // Email addresses
  { pattern: /whatsapp/i, name: "WhatsApp" }, // WhatsApp mentions
  { pattern: /telegram/i, name: "Telegram" }, // Telegram mentions
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, name: "phone number" }, // Formatted phone (xxx-xxx-xxxx)
];

function detectContactSharing(text: string): string | null {
  for (const { pattern, name } of CONTACT_PATTERNS) {
    if (pattern.test(text)) {
      return name;
    }
  }
  return null;
}

function MessageInput({
  onSend,
  isPending,
  userRole,
  onTyping,
}: {
  onSend: (message: string) => void;
  isPending: boolean;
  userRole: "customer" | "professional";
  onTyping?: (isTyping: boolean) => void;
}) {
  const [message, setMessage] = useState("");
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // React 19: useActionState for form submission
  const [_state, formAction, isFormPending] = useActionState(
    async (_prevState: { success: boolean }, formData: FormData) => {
      const messageText = formData.get("message") as string;
      if (messageText?.trim()) {
        // Stop typing indicator before sending
        onTyping?.(false);
        await onSend(messageText);
        setMessage("");
        setHasShownWarning(false); // Reset warning state after sending
        // Focus input after sending
        inputRef.current?.focus();
      }
      return { success: true };
    },
    { success: false }
  );

  const isSending = isFormPending || isPending;

  // Handle message input changes with contact detection and typing indicator
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Trigger typing indicator
    if (onTyping) {
      if (newMessage.trim()) {
        onTyping(true);
      } else {
        onTyping(false);
      }
    }

    // Only show warning once per message composition
    if (!hasShownWarning && newMessage.trim()) {
      const detectedContact = detectContactSharing(newMessage);
      if (detectedContact) {
        toast.warning(
          `Reminder: Keep communication in-app until booking is confirmed. Sharing ${detectedContact} may violate our terms.`,
          { duration: 5000 }
        );
        setHasShownWarning(true);
      }
    }
  };

  // Handle quick reply selection
  const handleQuickReply = (replyMessage: string) => {
    setMessage(replyMessage);
    inputRef.current?.focus();
  };

  return (
    <form action={formAction} className="space-y-4 border-neutral-200 border-t bg-neutral-50 p-6">
      {/* Quick Replies for Professionals */}
      {userRole === "professional" && <QuickReplies onSelectReply={handleQuickReply} />}

      {/* Message Input */}
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-lg border border-neutral-200 px-4 py-4 text-base shadow-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20 disabled:opacity-50"
          disabled={isSending}
          name="message"
          onChange={handleMessageChange}
          placeholder="Type a message..."
          ref={inputRef}
          type="text"
          value={message}
        />
        <button
          className="rounded-lg bg-rausch-500 px-6 py-4 font-semibold text-base text-white transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!message.trim() || isSending}
          type="submit"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
