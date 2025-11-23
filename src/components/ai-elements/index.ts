/**
 * AI Elements - Complete AI Assistant Component System
 *
 * Components for building AI-powered chat interfaces:
 * - Message bubbles with markdown support
 * - Interactive cards for recommendations
 * - Suggestions and quick actions
 * - Full assistant with panel
 *
 * Following Lia Design System.
 */

// Conversation components
export {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  type ConversationContentProps,
  type ConversationEmptyStateProps,
  type ConversationProps,
  type ConversationScrollButtonProps,
} from "./conversation";

// Message components
export {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachments,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
} from "./message";

// Suggestion components
export {
  Suggestion,
  Suggestions,
  type SuggestionProps,
  type SuggestionsProps,
} from "./suggestion";

// Loader components
export { Loader } from "./loader";

// Tool components
export {
  Tool,
  ToolContent,
  ToolHeader,
  ToolIcon,
  ToolResult,
  ToolStatus,
} from "./tool";

// Interactive cards
export {
  BookingSuggestionCard,
  CardCarousel,
  CardCarouselItem,
  CardContainer,
  ProfessionalCard,
  QuickAction,
  QuickActions,
  ServiceActionCard,
  type BookingSuggestion,
  type ProfessionalRecommendation,
  type ServiceAction,
} from "./interactive-cards";

// Full assistant
export {
  Assistant,
  AssistantPanel,
  FloatingAssistantButton,
  type AssistantMessage,
  type AssistantSuggestion,
} from "./assistant";
