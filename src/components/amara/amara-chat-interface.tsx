"use client";

/**
 * Amara Chat Interface
 *
 * Main chat window component for the Amara AI assistant.
 * Uses Vercel AI SDK's useChat hook for streaming responses.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HelpCircle, Home, Loader2, MessageSquare, Newspaper, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AmaraIcon } from "./amara-icon";
import { AmaraMessageActions } from "./amara-message-actions";
import {
  AmaraQuickReplies,
  getContextualQuickReplies,
  type QuickReply,
} from "./amara-quick-replies";
import "./amara-animations.css";

type AmaraChatInterfaceProps = {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
};

export function AmaraChatInterface({ isOpen, onClose }: AmaraChatInterfaceProps) {
  const t = useTranslations("amara");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [input, setInput] = useState("");

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
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          parts: [{ type: "text", text: t("welcomeMessage") }],
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

  // Update quick replies based on conversation state
  useEffect(() => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").at(-1);

    // Extract text from parts array (v6 format)
    const lastMessageText = lastAssistantMessage?.parts?.find((p) => p.type === "text")?.text;

    const contextualReplies = getContextualQuickReplies(messages.length, lastMessageText, t);

    setQuickReplies(contextualReplies);
  }, [messages, t]);

  // Handle quick reply selection
  const handleQuickReplySelect = (reply: QuickReply) => {
    setInput(reply.text);
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
    <div className="amara-chat-window fixed inset-0 z-50 flex flex-col bg-white transition-all duration-300 sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[600px] sm:w-full sm:max-w-[420px] sm:rounded-2xl sm:border sm:border-gray-200/60 sm:shadow-[0_16px_60px_rgba(0,0,0,0.15)] md:right-6 md:bottom-6 md:h-[680px] md:max-w-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between border-gray-100 border-b bg-white px-4 py-3 sm:rounded-t-2xl sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <AmaraIcon className="text-[#8B7355]" size={40} />
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-900">{t("title")}</h3>
            <p className="text-gray-500 text-sm">{t("subtitle")}</p>
          </div>
        </div>
        <button
          aria-label={t("closeChat")}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 px-4 py-4 sm:px-6 sm:py-6">
        {/* Greeting Section */}
        {messages.length === 1 && (
          <div className="space-y-4 pb-6">
            <div className="amara-message flex justify-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                <AmaraIcon className="text-[#8B7355]" size={32} />
              </div>
              <div className="max-w-[85%] rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-900 shadow-sm sm:max-w-[75%]">
                <p className="text-[15px] leading-relaxed">{t("greeting")}</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            className={cn(
              "amara-message flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            key={message.id}
          >
            {/* Assistant avatar */}
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                <AmaraIcon className="text-[#8B7355]" size={32} />
              </div>
            )}

            <div className="group flex flex-col">
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md sm:max-w-[75%]",
                  message.role === "user"
                    ? "bg-[#8B7355] text-white"
                    : "border border-gray-100 bg-white text-gray-900"
                )}
              >
                {/* Render message parts */}
                {message.parts?.map((part, partIndex) => {
                  if (part.type === "text") {
                    return (
                      <p
                        className="whitespace-pre-wrap text-[15px] leading-relaxed"
                        key={partIndex}
                      >
                        {part.text}
                      </p>
                    );
                  }

                  // Handle tool-call parts (v6 format)
                  if (part.type.startsWith("tool-")) {
                    const toolName = part.type.replace("tool-", "");
                    return (
                      <div
                        className={cn(
                          "mt-3 rounded-lg border p-3 text-xs",
                          message.role === "user"
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-blue-100 bg-blue-50 text-blue-900"
                        )}
                        key={partIndex}
                      >
                        <p className="font-medium">
                          {toolName === "searchProfessionals" && t("searchingProfessionals")}
                          {toolName === "checkAvailability" && t("checkingAvailability")}
                          {toolName === "createBookingDraft" && t("creatingBookingDraft")}
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Message Actions (only for assistant messages) */}
              {message.role === "assistant" && message.id !== "welcome" && (
                <AmaraMessageActions
                  content={message.parts?.find((p) => p.type === "text")?.text || ""}
                  messageId={message.id}
                />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="amara-typing-indicator flex justify-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
              <AmaraIcon className="text-[#8B7355]" size={32} />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="amara-typing-dot h-2 w-2 rounded-full bg-gray-400" />
                <div className="amara-typing-dot h-2 w-2 rounded-full bg-gray-400" />
                <div className="amara-typing-dot h-2 w-2 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="amara-error rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {t("errorMessage")}
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {!isLoading && quickReplies.length > 0 && (
          <div className="pt-2">
            <AmaraQuickReplies
              disabled={isLoading}
              onSelect={handleQuickReplySelect}
              replies={quickReplies}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      {messages.length === 1 && (
        <div className="border-gray-100 border-t bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-4 gap-2">
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 sm:px-3"
              href="/"
            >
              <Home className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700 text-xs">Home</span>
            </Link>
            <button
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 sm:px-3"
              type="button"
            >
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700 text-xs">Messages</span>
            </button>
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 sm:px-3"
              href="/support/account-suspended"
            >
              <HelpCircle className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700 text-xs">Help</span>
            </Link>
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 sm:px-3"
              href="/changelog"
            >
              <Newspaper className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700 text-xs">News</span>
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        className="border-gray-100 border-t bg-white px-4 py-3 sm:rounded-b-2xl sm:px-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) {
            return;
          }

          const message = input;
          setInput(""); // Clear input immediately

          await sendMessage({
            role: "user",
            parts: [{ type: "text", text: message }],
          });
        }}
      >
        <div className="mb-3 flex items-end gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 transition placeholder:text-gray-400 focus:border-[#8B7355] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B7355]/10"
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
            className="flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-xl bg-[#8B7355] text-white shadow-sm transition hover:bg-[#9B8B7E] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#8B7355]"
            disabled={isLoading || !input.trim()}
            type="submit"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Privacy Policy Text */}
        <p className="text-center text-gray-500 text-xs">
          By chatting with Amara, you agree to our{" "}
          <Link className="text-[#8B7355] hover:underline" href="/privacy">
            Privacy Policy
          </Link>
        </p>
      </form>
    </div>
  );
}
