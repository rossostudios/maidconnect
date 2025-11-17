"use client";

/**
 * @deprecated This component is deprecated and should not be used.
 * Use @/components/amara/amara-chat-interface instead.
 *
 * This older version is kept for reference but lacks:
 * - Escape key dismissal handler
 * - Backdrop click-to-dismiss functionality
 * - Latest Lia design system updates
 * - Improved accessibility features
 *
 * The newer amara-chat-interface.tsx component is the maintained version.
 */

/**
 * Amara Chat Interface (DEPRECATED - USE amara-chat-interface.tsx)
 *
 * Main chat window component for the Amara AI assistant.
 * Uses Vercel AI SDK's useChat hook for streaming responses.
 */

import { useChat } from "@ai-sdk/react";
import {
  Cancel01Icon,
  HelpCircleIcon,
  Home01Icon,
  Loading01Icon,
  Message01Icon,
  NewsIcon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FileUIPart, ToolUIPart } from "ai";
import { DefaultChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
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
import { AmaraIcon } from "./AmaraIcon";
import { AmaraMessageActions } from "./AmaraMessage";
import { getContextualQuickReplies, type QuickReply } from "./AmaraQuick";

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
    <Card className="amara-chat-window sm: fixed inset-0 z-50 flex flex-col border-neutral-200 bg-white transition-all duration-300 sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[600px] sm:w-full sm:max-w-[420px] sm:border sm:shadow-lg md:right-6 md:bottom-6 md:h-[680px] md:max-w-[480px]">
      {/* Header */}
      <div className="sm: flex items-center justify-between border-neutral-200 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <AmaraIcon className="text-neutral-900" size={40} />
          </div>
          <div>
            <h3 className="font-semibold text-base text-neutral-900">{t("title")}</h3>
            <p className="text-neutral-500 text-sm">{t("subtitle")}</p>
          </div>
        </div>
        <button
          aria-label={t("closeChat")}
          className="inline-flex h-11 w-11 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          onClick={onClose}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.length === 1 && (
              <ConversationEmptyState
                description={t("greeting")}
                icon={<AmaraIcon className="text-neutral-900" size={36} />}
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
                    avatar={<AmaraIcon className="mx-auto mt-1" size={28} />}
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
              <div className="flex items-center gap-3 border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                <AmaraIcon className="text-neutral-900" size={28} />
                <Loader />
                <span className="text-neutral-500 text-sm">{t("typing")}</span>
              </div>
            )}

            {error && (
              <div className="border border-red-300 bg-neutral-100 px-4 py-3 text-neutral-800 text-sm">
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

      {/* Action Buttons */}
      {messages.length === 1 && (
        <div className="border-neutral-200 border-t bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-4 gap-2">
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 border border-neutral-200 bg-white px-2 py-3 text-center transition hover:border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 sm:px-3"
              href="/"
            >
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Home01Icon} />
              <span className="font-medium text-neutral-600 text-xs">Home</span>
            </Link>
            <button
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 border border-neutral-200 bg-white px-2 py-3 text-center transition hover:border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 sm:px-3"
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Message01Icon} />
              <span className="font-medium text-neutral-600 text-xs">Messages</span>
            </button>
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 border border-neutral-200 bg-white px-2 py-3 text-center transition hover:border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 sm:px-3"
              href="/support/account-suspended"
            >
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={HelpCircleIcon} />
              <span className="font-medium text-neutral-600 text-xs">Help</span>
            </Link>
            <Link
              className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 border border-neutral-200 bg-white px-2 py-3 text-center transition hover:border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 sm:px-3"
              href="/changelog"
            >
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={NewsIcon} />
              <span className="font-medium text-neutral-600 text-xs">News</span>
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        className="sm: border-neutral-200 border-t bg-white px-4 py-3 sm:px-6"
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
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-900 transition placeholder:text-neutral-600 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
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
            className="inline-flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center bg-neutral-900 text-neutral-50 shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-900"
            disabled={isLoading || !input.trim()}
            type="submit"
          >
            {isLoading ? (
              <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading01Icon} />
            ) : (
              <HugeiconsIcon className="h-5 w-5" icon={SentIcon} />
            )}
          </button>
        </div>

        {/* Privacy Policy Text */}
        <p className="text-center text-neutral-500 text-xs">
          By chatting with Amara, you agree to our{" "}
          <Link className="text-neutral-900" href="/privacy">
            Privacy Policy
          </Link>
        </p>
      </form>
    </Card>
  );
}
