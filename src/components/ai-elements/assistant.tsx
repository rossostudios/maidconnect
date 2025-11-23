"use client";

/**
 * AI Assistant - Full-Featured Chat Interface
 *
 * Complete AI assistant component with:
 * - Message history with streaming support
 * - Interactive cards for recommendations
 * - Quick action suggestions
 * - Input with attachments
 *
 * Inspired by Airbnb's 2025 AI concierge.
 *
 * Following Lia Design System.
 */

import {
  ArrowUp01Icon,
  Cancel01Icon,
  Image01Icon,
  MagicWand01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FormEvent, KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./conversation";
import { Loader } from "./loader";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
} from "./message";
import { Suggestion, Suggestions } from "./suggestion";

// ============================================================================
// Types
// ============================================================================

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  cards?: React.ReactNode;
  actions?: React.ReactNode;
};

export type AssistantSuggestion = {
  id: string;
  text: string;
};

type AssistantProps = {
  messages: AssistantMessage[];
  suggestions?: AssistantSuggestion[];
  isLoading?: boolean;
  onSendMessage?: (message: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  onCopyMessage?: (messageId: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
};

// ============================================================================
// Assistant Avatar
// ============================================================================

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
      <HugeiconsIcon className="h-4 w-4 text-orange-600" icon={SparklesIcon} />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Assistant({
  messages,
  suggestions = [],
  isLoading = false,
  onSendMessage,
  onSuggestionClick,
  onCopyMessage,
  onRegenerateMessage,
  placeholder = "Ask me anything...",
  emptyStateTitle = "Hi! I'm your Casaora Assistant",
  emptyStateDescription = "I can help you find professionals, book services, manage appointments, and answer questions about Casaora.",
  className,
}: AssistantProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      onSendMessage?.(input.trim());
      setInput("");
      inputRef.current?.focus();
    },
    [input, isLoading, onSendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      onSuggestionClick?.(suggestion);
      onSendMessage?.(suggestion);
    },
    [onSuggestionClick, onSendMessage]
  );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Conversation Area */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              description={emptyStateDescription}
              icon={
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                  <HugeiconsIcon className="h-8 w-8 text-orange-600" icon={MagicWand01Icon} />
                </div>
              }
              title={emptyStateTitle}
            >
              {/* Welcome Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-6 w-full max-w-md">
                  <p className={cn("mb-3 text-center text-neutral-500 text-sm", geistSans.className)}>
                    Try asking about:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion) => (
                      <Suggestion
                        key={suggestion.id}
                        onClickSuggestion={handleSuggestionClick}
                        suggestion={suggestion.text}
                      />
                    ))}
                  </div>
                </div>
              )}
            </ConversationEmptyState>
          ) : (
            <>
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageAvatar
                    avatar={message.role === "assistant" ? <AssistantAvatar /> : undefined}
                    from={message.role}
                  />
                  <div className="min-w-0 max-w-[85%] space-y-2">
                    <MessageContent from={message.role}>
                      <MessageMarkdown text={message.content} />

                      {/* Embedded Cards */}
                      {message.cards}

                      {/* Message Actions */}
                      {message.role === "assistant" && (
                        <MessageActions>
                          <MessageAction onClick={() => onCopyMessage?.(message.id)}>
                            Copy
                          </MessageAction>
                          <MessageAction onClick={() => onRegenerateMessage?.(message.id)}>
                            Regenerate
                          </MessageAction>
                        </MessageActions>
                      )}
                    </MessageContent>

                    {/* Custom Actions Below Message */}
                    {message.actions}
                  </div>
                </Message>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <Message from="assistant">
                  <MessageAvatar avatar={<AssistantAvatar />} from="assistant" />
                  <MessageContent from="assistant">
                    <Loader />
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Suggestions (when there are messages) */}
      {messages.length > 0 && suggestions.length > 0 && !isLoading && (
        <div className="border-neutral-100 border-t px-4 py-2">
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion.id}
                onClickSuggestion={handleSuggestionClick}
                suggestion={suggestion.text}
              />
            ))}
          </Suggestions>
        </div>
      )}

      {/* Input Area */}
      <div className="border-neutral-200 border-t bg-white p-4">
        <form className="relative" onSubmit={handleSubmit}>
          <textarea
            className={cn(
              "w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-neutral-900 text-sm placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25",
              geistSans.className
            )}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            rows={1}
            value={input}
          />
          <Button
            className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 p-0"
            disabled={!input.trim() || isLoading}
            size="sm"
            type="submit"
          >
            <HugeiconsIcon className="h-4 w-4" icon={ArrowUp01Icon} />
          </Button>
        </form>
        <p className={cn("mt-2 text-center text-neutral-400 text-xs", geistSans.className)}>
          AI assistant may make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Floating Assistant Button
// ============================================================================

type FloatingAssistantButtonProps = {
  onClick?: () => void;
  isOpen?: boolean;
  className?: string;
};

export function FloatingAssistantButton({
  onClick,
  isOpen = false,
  className,
}: FloatingAssistantButtonProps) {
  return (
    <button
      aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      className={cn(
        "fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95",
        isOpen && "rotate-45",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <HugeiconsIcon
        className="h-6 w-6 transition-transform"
        icon={isOpen ? Cancel01Icon : SparklesIcon}
      />
    </button>
  );
}

// ============================================================================
// Assistant Panel (Slide-out Drawer)
// ============================================================================

type AssistantPanelProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function AssistantPanel({ isOpen, onClose, children, className }: AssistantPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-neutral-200 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
              <HugeiconsIcon className="h-4 w-4 text-orange-600" icon={SparklesIcon} />
            </div>
            <div>
              <h2 className={cn("font-semibold text-neutral-900", geistSans.className)}>
                Casaora Assistant
              </h2>
              <p className={cn("text-neutral-500 text-xs", geistSans.className)}>
                Powered by AI
              </p>
            </div>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-60px)]">
          {children}
        </div>
      </div>
    </>
  );
}
