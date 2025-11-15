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
import { AmaraIcon } from "./amara-icon";
import { AmaraMessageActions } from "./amara-message-actions";
import { getContextualQuickReplies, type QuickReply } from "./amara-quick-replies";

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

  // Set initial welcome message with timeline expectations
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = `${t("welcomeMessage")}\n\n**Response Times:**\n- Simple questions: Immediate\n- Booking assistance: Within 1 business day\n- Custom service requests: We'll send 3–5 matched professionals within 5 business days\n\n[Learn more about our service timelines →](/help/expectations-and-timelines)\n\nHow can I help you today?`;

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
    <Card className="amara-chat-window fixed inset-0 z-50 flex flex-col border-neutral-200 bg-white shadow-2xl transition-all duration-300 sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[600px] sm:w-full sm:max-w-[420px] sm:border md:right-6 md:bottom-6 md:h-[680px] md:max-w-[480px]">
      {/* Header - Lia Design */}
      <div className="flex items-center justify-between border-neutral-200 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-orange-500 bg-orange-50">
            <AmaraIcon className="text-orange-600" size={40} />
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
          className="inline-flex h-10 w-10 items-center justify-center border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
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
              <div className="flex items-center gap-3 border border-orange-200 bg-orange-50 px-4 py-3 shadow-sm">
                <AmaraIcon className="text-orange-600" size={28} />
                <Loader />
                <span className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  {t("typing")}
                </span>
              </div>
            )}

            {error && (
              <div className="border border-red-300 bg-red-50 px-4 py-3 font-[family-name:var(--font-geist-sans)] text-red-700 text-sm">
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

      {/* Action Buttons - Precision Grid */}
      {messages.length === 1 && (
        <div className="border-neutral-200 border-t bg-neutral-50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-4 gap-2">
            <Link
              className="group flex min-h-[68px] flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
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
              className="group flex min-h-[68px] flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
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
              className="group flex min-h-[68px] flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
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
              className="group flex min-h-[68px] flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-2 py-3 text-center transition-all hover:border-orange-500 hover:bg-orange-50 active:scale-95 sm:px-3"
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
        className="border-neutral-200 border-t bg-white px-4 py-3 sm:px-6"
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
              className="w-full border border-neutral-200 bg-white px-4 py-3 font-[family-name:var(--font-geist-sans)] text-[15px] text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25"
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
            className="inline-flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center border border-orange-500 bg-orange-500 text-white shadow-sm transition-all hover:border-orange-600 hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-500"
            disabled={isLoading || !input.trim()}
            type="submit"
          >
            {isLoading ? (
              <HugeiconsIcon
                className="h-5 w-5 animate-spin"
                icon={Loading01Icon}
                strokeWidth={1.5}
              />
            ) : (
              <HugeiconsIcon className="h-5 w-5" icon={SentIcon} strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Privacy Policy Text */}
        <p className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-600 text-xs">
          By chatting with Amara, you agree to our{" "}
          <Link className="text-orange-600 transition-colors hover:text-orange-700" href="/privacy">
            Privacy Policy
          </Link>
        </p>
      </form>
    </Card>
  );
}
