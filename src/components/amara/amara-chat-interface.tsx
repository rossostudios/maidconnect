"use client";

/**
 * Amara Chat Interface
 *
 * Main chat window component for the Amara AI assistant.
 * Uses Vercel AI SDK v6 Beta with DefaultChatTransport for streaming responses.
 *
 * Future enhancement: Add stream resume support with conversation persistence.
 */

import { useChat } from "@ai-sdk/react";
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
import type { FileUIPart, ToolUIPart } from "ai";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAttachments,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
} from "@/components/ai-elements/message";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { ToolCall } from "@/components/ai-elements/tool";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import type { BookingIntent } from "@/lib/integrations/amara/schemas";
import { AmaraMessageActions } from "./amara-message-actions";
import { getContextualQuickReplies, type QuickReply } from "./amara-quick-replies";

type AmaraChatInterfaceProps = {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
};

export function AmaraChatInterface({ isOpen, onClose, locale }: AmaraChatInterfaceProps) {
  const t = useTranslations("amara");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [input, setInput] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<BookingIntent | null>(null);
  const [detectingIntent, setDetectingIntent] = useState(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/amara/chat",
    }),
    onError: (chatError) => {
      console.error("Amara chat error:", chatError);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = `${t("welcomeMessage")}\n\nHow can I help you today?`;

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          parts: [{ type: "text", text: welcomeText }],
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, setMessages, t]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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

    // Extract text from parts array (v6 format)
    const lastMessageText = lastAssistantMessage?.parts?.find((p) => p.type === "text")?.text;

    const contextualReplies = getContextualQuickReplies(messages.length, lastMessageText, t);

    setQuickReplies(contextualReplies);
  }, [messages, t]);

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

  // Detect booking intent in user message
  const detectBookingIntent = async (userMessage: string) => {
    setDetectingIntent(true);
    try {
      const response = await fetch("/api/amara/booking-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          locale: locale || "en",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to detect intent");
      }

      const data = await response.json();

      // Only set intent if confidence is high enough (>70%)
      if (data.confidence && data.confidence >= 70) {
        setDetectedIntent(data);
      }
    } catch (error) {
      console.error("Intent detection failed:", error);
      // Silently fail - don't disrupt chat experience
    } finally {
      setDetectingIntent(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop - Click to dismiss */}
      <div
        aria-label="Close chat"
        className="fixed inset-0 z-60 bg-neutral-900/50 transition-opacity sm:bg-neutral-900/30"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      <Card className="amara-chat-window fixed inset-0 z-70 flex flex-col overflow-hidden border-neutral-200 bg-white shadow-2xl transition-all duration-300 sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[600px] sm:w-full sm:max-w-[420px] sm:rounded-lg sm:border md:right-6 md:bottom-6 md:h-[680px] md:max-w-[480px]">
        {/* Header - Lia Design */}
        <div className="flex flex-shrink-0 items-center justify-between border-neutral-200 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500 bg-orange-50">
              <Image
                alt="Amara AI Assistant"
                className="h-6 w-6"
                height={24}
                src="/amara-floating-chat.svg"
                width={24}
              />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-base text-neutral-900 tracking-tight">
                {t("title")}
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            aria-label={t("closeChat")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white">
          <Conversation className="h-full">
            <ConversationContent>
              {messages.length === 1 && (
                <ConversationEmptyState
                  description={t("greeting")}
                  icon={
                    <Image
                      alt="Amara AI Assistant"
                      className="h-9 w-9"
                      height={36}
                      src="/amara-floating-chat.svg"
                      width={36}
                    />
                  }
                  title={t("title")}
                />
              )}

              {messages.map((message) => {
                const textParts = message.parts?.filter((part) => part.type === "text") || [];
                const fileParts = (message.parts?.filter((part) => part.type === "file") ||
                  []) as FileUIPart[];
                const toolParts = (message.parts?.filter((part) => part.type.startsWith("tool-")) ||
                  []) as ToolUIPart[];

                return (
                  <Message from={message.role} key={message.id}>
                    <MessageAvatar
                      avatar={
                        <Image
                          alt="Amara AI Assistant"
                          className="mx-auto mt-1 h-7 w-7"
                          height={28}
                          src="/amara-floating-chat.svg"
                          width={28}
                        />
                      }
                      from={message.role}
                    />
                    <div>
                      <MessageContent from={message.role}>
                        {textParts.length > 0 &&
                          textParts.map((part, index) => (
                            <MessageMarkdown key={`${message.id}-text-${index}`} text={part.text} />
                          ))}
                        <MessageAttachments files={fileParts} />
                        {toolParts.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {toolParts.map((part) => (
                              <ToolCall key={part.toolCallId} part={part} />
                            ))}
                          </div>
                        )}
                      </MessageContent>
                      {message.role === "assistant" && message.id !== "welcome" && (
                        <MessageActions>
                          <AmaraMessageActions
                            content={textParts[0]?.text || ""}
                            messageId={message.id}
                          />
                        </MessageActions>
                      )}
                    </div>
                  </Message>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 shadow-sm">
                  <Image
                    alt="Amara AI Assistant"
                    className="h-7 w-7"
                    height={28}
                    src="/amara-floating-chat.svg"
                    width={28}
                  />
                  <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
                  <span className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                    {t("typing")}
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-[family-name:var(--font-geist-sans)] text-red-700 text-sm">
                  {t("errorMessage")}
                </div>
              )}

              {!isLoading && quickReplies.length > 0 && (
                <Suggestions>
                  {quickReplies.map((reply) => (
                    <Suggestion
                      key={reply.text}
                      onClickSuggestion={() => handleQuickReplySelect(reply.text)}
                      suggestion={reply.text}
                    />
                  ))}
                </Suggestions>
              )}

              <div ref={messagesEndRef} />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        {/* Booking Intent Detection Card */}
        {(detectingIntent || detectedIntent) && (
          <div className="border-neutral-200 border-t bg-neutral-50 px-4 py-3 sm:px-6 sm:py-4">
            {detectingIntent ? (
              <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-white px-4 py-3">
                <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
                <span className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  Analyzing your request...
                </span>
              </div>
            ) : (
              detectedIntent && (
                <div className="space-y-3 rounded-lg border border-orange-200 bg-white px-4 py-4 sm:px-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        className="h-5 w-5 text-orange-600"
                        icon={CheckmarkCircle02Icon}
                        strokeWidth={1.5}
                      />
                      <h4 className="font-[family-name:var(--font-geist-sans)] font-semibold text-base text-neutral-900">
                        Booking Request Detected
                      </h4>
                    </div>
                    <button
                      className="text-neutral-400 transition-colors hover:text-neutral-600"
                      onClick={() => setDetectedIntent(null)}
                      type="button"
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Intent Details */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm">
                        Service:
                      </span>
                      <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm">
                        {detectedIntent.serviceType
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>

                    {detectedIntent.location?.city && (
                      <div className="flex items-start gap-2">
                        <HugeiconsIcon
                          className="mt-0.5 h-4 w-4 text-neutral-600"
                          icon={Location01Icon}
                          strokeWidth={1.5}
                        />
                        <span className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                          {detectedIntent.location.city}
                          {detectedIntent.location.neighborhood &&
                            `, ${detectedIntent.location.neighborhood}`}
                        </span>
                      </div>
                    )}

                    {detectedIntent.requirements && (
                      <div className="flex items-start gap-2">
                        <span className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm">
                          Requirements:
                        </span>
                        <span className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                          {detectedIntent.requirements}
                        </span>
                      </div>
                    )}

                    {detectedIntent.urgency && detectedIntent.urgency !== "not_specified" && (
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-[family-name:var(--font-geist-sans)] text-xs ${
                            detectedIntent.urgency === "urgent"
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : detectedIntent.urgency === "flexible"
                                ? "border border-blue-200 bg-blue-50 text-blue-700"
                                : "border border-orange-200 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {detectedIntent.urgency === "urgent" && "🔴"}
                          {detectedIntent.urgency === "asap" && "⚡"}
                          {detectedIntent.urgency === "flexible" && "📅"}
                          {detectedIntent.urgency
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    className="group flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500 bg-orange-500 px-6 py-3 font-[family-name:var(--font-geist-sans)] font-semibold text-white transition-all hover:border-orange-600 hover:bg-orange-600 active:scale-95"
                    href={`/professionals?service=${detectedIntent.serviceType}${
                      detectedIntent.location?.city
                        ? `&location=${detectedIntent.location.city}`
                        : ""
                    }`}
                  >
                    <span>Find Professionals</span>
                    <HugeiconsIcon
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      icon={ArrowRight01Icon}
                      strokeWidth={1.5}
                    />
                  </Link>

                  {/* Confidence Indicator */}
                  {detectedIntent.confidence && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${detectedIntent.confidence}%` }}
                        />
                      </div>
                      <span className="font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs">
                        {detectedIntent.confidence}% match
                      </span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Action Buttons - Precision Grid */}
        {messages.length === 1 && (
          <div className="border-neutral-200 border-t bg-neutral-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="grid grid-cols-4 gap-2">
              <Link
                className="group flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
                href="/"
              >
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-orange-600"
                  icon={Home01Icon}
                  strokeWidth={1.5}
                />
                <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-xs transition-colors group-hover:text-orange-600">
                  Home
                </span>
              </Link>
              <button
                className="group flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
                type="button"
              >
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-orange-600"
                  icon={Message01Icon}
                  strokeWidth={1.5}
                />
                <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-xs transition-colors group-hover:text-orange-600">
                  Messages
                </span>
              </button>
              <Link
                className="group flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
                href="/help"
              >
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-orange-600"
                  icon={HelpCircleIcon}
                  strokeWidth={1.5}
                />
                <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-xs transition-colors group-hover:text-orange-600">
                  Help
                </span>
              </Link>
              <Link
                className="group flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
                href="/changelog"
              >
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-orange-600"
                  icon={NewsIcon}
                  strokeWidth={1.5}
                />
                <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-xs transition-colors group-hover:text-orange-600">
                  News
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Input - Lia Design */}
        <form
          className="flex-shrink-0 border-neutral-200 border-t bg-white px-4 py-3 sm:px-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!input.trim() || isLoading) {
              return;
            }

            const message = input;
            setInput(""); // Clear input immediately

            // Detect booking intent (runs in parallel with chat response)
            detectBookingIntent(message);

            await sendMessage({
              role: "user",
              parts: [{ type: "text", text: message }],
            });
          }}
        >
          <div className="mb-3 flex items-end gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 font-[family-name:var(--font-geist-sans)] text-[15px] text-neutral-900 transition-all placeholder:text-neutral-600 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                disabled={isLoading}
                maxLength={500}
                name="message"
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                ref={inputRef}
                value={input}
              />
            </div>
            <button
              aria-label={t("send")}
              className="inline-flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-orange-500 bg-orange-500 text-white shadow-sm transition-all hover:border-orange-600 hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-500"
              disabled={isLoading || !input.trim()}
              type="submit"
            >
              {isLoading ? (
                <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
              ) : (
                <HugeiconsIcon className="h-5 w-5" icon={SentIcon} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Privacy Policy Text */}
          <p className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-600 text-xs">
            By chatting with Amara, you agree to our{" "}
            <Link
              className="text-orange-600 transition-colors hover:text-orange-700"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </p>
        </form>
      </Card>
    </>
  );
}
