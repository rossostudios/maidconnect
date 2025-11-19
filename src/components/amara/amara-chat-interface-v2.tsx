"use client";

/**
 * Amara Chat Interface V2 (Generative UI)
 *
 * Uses Vercel AI SDK ai/rsc with Server Actions to stream interactive React components.
 * Renders Professional Cards, Availability Selectors, and other UI elements inline.
 *
 * Key differences from V1:
 * - Uses Server Actions instead of API routes
 * - Streams React components instead of text
 * - Progressive UI rendering with streamUI
 */

import {
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  Home01Icon,
  Loading03Icon,
  Location01Icon,
  Message01Icon,
  NewsIcon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useOptimistic, useTransition } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { continueConversation } from "@/app/actions/amara/chat";
import {
  trackAmaraConversationStarted,
  trackAmaraMessageSent,
  trackAmaraV2Enabled,
} from "@/lib/analytics/amara-events";
import { AmaraMessageActions } from "./amara-message-actions";
import { getContextualQuickReplies, type QuickReply } from "./amara-quick-replies";

type AmaraChatInterfaceV2Props = {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
  userId?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  display: React.ReactNode;
};

export function AmaraChatInterfaceV2({
  isOpen,
  onClose,
  locale,
  userId,
}: AmaraChatInterfaceV2Props) {
  const t = useTranslations("amara");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<ChatMessage[], ChatMessage>(
    messages,
    (state, newMessage) => [...state, newMessage]
  );

  // Track V2 enabled on mount
  useEffect(() => {
    if (userId) {
      trackAmaraV2Enabled(userId);
    }
  }, [userId]);

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = `${t("welcomeMessage")}\n\nHow can I help you today?`;

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          display: (
            <div className="space-y-2 text-neutral-700">
              <p>{t("welcomeMessage")}</p>
              <p>How can I help you today?</p>
            </div>
          ),
        },
      ]);

      // Track conversation start
      trackAmaraConversationStarted("welcome", "v2");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, t]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [optimisticMessages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Update quick replies based on conversation state
  useEffect(() => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").at(-1);
    const contextualReplies = getContextualQuickReplies(
      messages.length,
      lastAssistantMessage?.content,
      t
    );
    setQuickReplies(contextualReplies);
  }, [messages, t]);

  // Handle message submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim() || isPending) {
      return;
    }

    const userMessage = input.trim();
    setInput("");

    // Add user message optimistically
    const userMessageId = crypto.randomUUID();
    const userChatMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: userMessage,
      display: <div className="text-neutral-900">{userMessage}</div>,
    };

    addOptimisticMessage(userChatMessage);

    // Track message sent
    trackAmaraMessageSent({
      conversationId: conversationId || "new",
      messageCount: messages.length + 1,
      version: "v2",
    });

    // Call Server Action
    startTransition(async () => {
      try {
        const response = await continueConversation({
          message: userMessage,
          conversationId: conversationId || undefined,
        });

        // Update messages with actual response
        setMessages((prev) => [
          ...prev,
          userChatMessage,
          {
            id: response.id,
            role: response.role,
            display: response.display,
          },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);

        // Add error message
        setMessages((prev) => [
          ...prev,
          userChatMessage,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            display: (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                Sorry, I encountered an error. Please try again.
              </div>
            ),
          },
        ]);
      }
    });
  };

  // Handle quick reply selection
  const handleQuickReplySelect = (reply: QuickReply | string) => {
    const text = typeof reply === "string" ? reply : reply.text;
    setInput(text);
    // Auto-submit the quick reply
    setTimeout(() => {
      if (inputRef.current) {
        const form = inputRef.current.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }, 100);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Chat window */}
      <Card className="relative z-10 flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
              <Image
                src="/amara-avatar.png"
                alt="Amara"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Amara</h2>
              <p className="text-xs text-neutral-600">{t("subtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={t("close")}
          >
            <HugeiconsIcon Icon={Cancel01Icon} className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <Conversation className="flex-1 overflow-y-auto bg-neutral-50">
          {optimisticMessages.length === 0 ? (
            <ConversationEmptyState
              icon={<HugeiconsIcon Icon={Message01Icon} className="h-12 w-12" />}
              title={t("emptyStateTitle")}
              description={t("emptyStateDescription")}
            />
          ) : (
            <ConversationContent className="space-y-4 p-4">
              {optimisticMessages.map((message) => (
                <Message key={message.id} role={message.role}>
                  <MessageAvatar role={message.role} />
                  <MessageContent>
                    {message.display}
                    {message.role === "assistant" && (
                      <MessageActions>
                        <AmaraMessageActions messageId={message.id} content={message.content} />
                      </MessageActions>
                    )}
                  </MessageContent>
                </Message>
              ))}

              {/* Loading indicator */}
              {isPending && (
                <Message role="assistant">
                  <MessageAvatar role="assistant" />
                  <MessageContent>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <HugeiconsIcon Icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("thinking")}</span>
                    </div>
                  </MessageContent>
                </Message>
              )}

              <div ref={messagesEndRef} />
            </ConversationContent>
          )}

          <ConversationScrollButton />
        </Conversation>

        {/* Quick Replies */}
        {quickReplies.length > 0 && !isPending && (
          <div className="border-t border-neutral-200 bg-white px-4 py-3">
            <Suggestions>
              {quickReplies.map((reply) => (
                <Suggestion
                  key={reply.id}
                  onClick={() => handleQuickReplySelect(reply)}
                  icon={
                    <HugeiconsIcon
                      Icon={
                        reply.icon === "help"
                          ? HelpCircleIcon
                          : reply.icon === "location"
                            ? Location01Icon
                            : reply.icon === "home"
                              ? Home01Icon
                              : reply.icon === "news"
                                ? NewsIcon
                                : reply.icon === "check"
                                  ? CheckmarkCircle02Icon
                                  : Message01Icon
                      }
                      className="h-4 w-4"
                    />
                  }
                >
                  {reply.text}
                </Suggestion>
              ))}
            </Suggestions>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-neutral-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              disabled={isPending}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{t("send")}</span>
              <HugeiconsIcon Icon={isPending ? Loading03Icon : SentIcon} className="h-4 w-4" />
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-neutral-500">
            <Link
              href="/help"
              className="transition-colors hover:text-neutral-700 hover:underline"
            >
              {t("helpCenter")}
            </Link>
            <span>•</span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-neutral-700 hover:underline"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
