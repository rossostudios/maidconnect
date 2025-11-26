"use client";

/**
 * QuickReplies - Context-Aware Quick Reply Templates
 *
 * Enhanced quick reply component that provides context-aware suggestions
 * based on booking status and conversation state. Templates are personalized
 * with actual booking/user data.
 *
 * Key Features:
 * - Context-aware template prioritization
 * - Auto-fill templates with booking/user data
 * - Status-based smart suggestions
 * - Expandable/collapsible interface
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 active states
 * - neutral color palette
 */

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  HelpCircleIcon,
  Message01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type QuickReplyCategory =
  | "suggested"
  | "acceptance"
  | "questions"
  | "scheduling"
  | "in_service"
  | "completion"
  | "general";

export type QuickReplyTemplate = {
  id: string;
  label: string;
  message: string;
  category: QuickReplyCategory;
  /** Booking statuses this template is relevant for */
  relevantStatuses?: BookingStatus[];
  /** Icon to display */
  icon?: HugeIcon;
  /** Priority for sorting (lower = higher priority) */
  priority?: number;
};

export type BookingContext = {
  id: string;
  status: BookingStatus;
  serviceName: string;
  scheduledStart: string;
  scheduledEnd: string;
  customerName: string;
  address?: string;
};

export type QuickRepliesProps = {
  /** Called when a reply is selected */
  onSelectReply: (message: string) => void;
  /** Optional booking context for smart suggestions */
  bookingContext?: BookingContext | null;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Template Definitions
// ============================================================================

const BASE_TEMPLATES: QuickReplyTemplate[] = [
  // Acceptance messages (for pending bookings)
  {
    id: "accept-available",
    label: "Accept - Available",
    message:
      "Hello {customerName}! I'd be happy to help with your {serviceName} booking. I'm available at the requested time. Looking forward to working with you!",
    category: "acceptance",
    relevantStatuses: ["pending"],
    icon: CheckmarkCircle02Icon,
    priority: 1,
  },
  {
    id: "accept-confirm",
    label: "Accept - Confirm Details",
    message:
      "Thank you for your request, {customerName}! I can accommodate this booking for {serviceName}. Just to confirm the service details and address - could you verify everything looks correct?",
    category: "acceptance",
    relevantStatuses: ["pending"],
    icon: CheckmarkCircle02Icon,
    priority: 2,
  },
  {
    id: "decline-unavailable",
    label: "Decline - Unavailable",
    message:
      "Hi {customerName}, thank you for your interest! Unfortunately, I'm not available at this time. I recommend checking out other professionals on the platform who may be able to help.",
    category: "acceptance",
    relevantStatuses: ["pending"],
    priority: 10,
  },

  // Questions (for pending/confirmed bookings)
  {
    id: "question-details",
    label: "Ask About Details",
    message:
      "Thanks for reaching out, {customerName}! I have a few questions to ensure I can provide the best {serviceName}:\n\n1. Approximate square footage?\n2. Any specific areas needing extra attention?\n3. Any pets in the home?",
    category: "questions",
    relevantStatuses: ["pending", "confirmed"],
    icon: HelpCircleIcon,
    priority: 3,
  },
  {
    id: "question-access",
    label: "Ask About Access",
    message:
      "I'd love to help with your {serviceName}! Quick question about access: Will someone be home, or should we arrange a key pickup/lockbox access?",
    category: "questions",
    relevantStatuses: ["pending", "confirmed"],
    icon: HelpCircleIcon,
    priority: 4,
  },
  {
    id: "question-supplies",
    label: "Ask About Supplies",
    message:
      "I can definitely help with your {serviceName}! Do you have cleaning supplies and equipment, or would you prefer I bring my own? (Additional fee may apply)",
    category: "questions",
    relevantStatuses: ["pending", "confirmed"],
    icon: HelpCircleIcon,
    priority: 5,
  },

  // Scheduling
  {
    id: "schedule-alternative",
    label: "Propose Alternative Time",
    message:
      "Thank you for your booking request, {customerName}! I'm unfortunately not available at {scheduledTime}, but I have openings:\n\n• [Time option 1]\n• [Time option 2]\n\nWould either of these work for you?",
    category: "scheduling",
    relevantStatuses: ["pending"],
    icon: Calendar03Icon,
    priority: 6,
  },
  {
    id: "schedule-confirm",
    label: "Confirm Appointment",
    message:
      "Perfect, {customerName}! I have you scheduled for {serviceName} on {scheduledDate} at {scheduledTime}. I'll arrive promptly. See you then!",
    category: "scheduling",
    relevantStatuses: ["confirmed"],
    icon: Calendar03Icon,
    priority: 2,
  },
  {
    id: "schedule-reminder",
    label: "Reminder - Tomorrow",
    message:
      "Hi {customerName}! Just a friendly reminder that your {serviceName} is scheduled for tomorrow at {scheduledTime}. Please let me know if anything has changed!",
    category: "scheduling",
    relevantStatuses: ["confirmed"],
    icon: Calendar03Icon,
    priority: 3,
  },

  // In-Service (for in_progress bookings)
  {
    id: "inservice-arrived",
    label: "Arrived",
    message:
      "Hi {customerName}! I've arrived and am getting started on your {serviceName}. I'll keep you updated on progress!",
    category: "in_service",
    relevantStatuses: ["in_progress"],
    icon: Rocket01Icon,
    priority: 1,
  },
  {
    id: "inservice-running-late",
    label: "Running Late",
    message:
      "Hi {customerName}! I'm running about 15-20 minutes behind schedule due to traffic. I apologize for the inconvenience and will be there as soon as possible!",
    category: "in_service",
    relevantStatuses: ["confirmed", "in_progress"],
    icon: Clock01Icon,
    priority: 2,
  },
  {
    id: "inservice-update",
    label: "Progress Update",
    message:
      "Quick update, {customerName}! Your {serviceName} is going well. I'm about halfway through and everything is looking great. Will update when complete!",
    category: "in_service",
    relevantStatuses: ["in_progress"],
    icon: Rocket01Icon,
    priority: 3,
  },
  {
    id: "inservice-question",
    label: "Quick Question",
    message:
      "Hi {customerName}! Quick question while I'm working on your {serviceName} - [your question here]. Let me know when you can!",
    category: "in_service",
    relevantStatuses: ["in_progress"],
    icon: HelpCircleIcon,
    priority: 4,
  },

  // Completion (for in_progress/completed bookings)
  {
    id: "complete-finished",
    label: "Service Completed",
    message:
      "Hi {customerName}! I've completed your {serviceName}. Everything went smoothly and I've left the space in great condition. Thank you for choosing my services!",
    category: "completion",
    relevantStatuses: ["in_progress", "completed"],
    icon: CheckmarkCircle02Icon,
    priority: 1,
  },
  {
    id: "complete-followup",
    label: "Follow Up",
    message:
      "Hi {customerName}! I wanted to follow up on your recent {serviceName}. I hope everything was to your satisfaction. Please let me know if you need anything or would like to schedule another appointment!",
    category: "completion",
    relevantStatuses: ["completed"],
    icon: Message01Icon,
    priority: 2,
  },
  {
    id: "complete-review",
    label: "Request Review",
    message:
      "Hi {customerName}! Thank you so much for booking with me. If you were happy with the {serviceName}, I'd really appreciate if you could leave a review. It helps other customers find quality service!",
    category: "completion",
    relevantStatuses: ["completed"],
    icon: CheckmarkCircle02Icon,
    priority: 3,
  },

  // General (always available)
  {
    id: "general-thanks",
    label: "Thank You",
    message:
      "Thank you so much for choosing my services, {customerName}! I really appreciate your business and look forward to helping you again in the future.",
    category: "general",
    icon: Message01Icon,
    priority: 10,
  },
  {
    id: "general-greeting",
    label: "Greeting",
    message: "Hi {customerName}! Thanks for reaching out. How can I help you today?",
    category: "general",
    icon: Message01Icon,
    priority: 11,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fill template placeholders with actual booking data
 */
function fillTemplate(template: string, context: BookingContext | null): string {
  if (!context) {
    // Return template with generic placeholders if no context
    return template
      .replace(/{customerName}/g, "[Customer]")
      .replace(/{serviceName}/g, "[Service]")
      .replace(/{scheduledDate}/g, "[Date]")
      .replace(/{scheduledTime}/g, "[Time]")
      .replace(/{address}/g, "[Address]");
  }

  const scheduledDate = new Date(context.scheduledStart);

  return template
    .replace(/{customerName}/g, context.customerName.split(" ")[0]) // Use first name
    .replace(/{serviceName}/g, context.serviceName)
    .replace(/{scheduledDate}/g, format(scheduledDate, "EEEE, MMMM d"))
    .replace(/{scheduledTime}/g, format(scheduledDate, "h:mm a"))
    .replace(/{address}/g, context.address || "[Address]");
}

/**
 * Get context-aware suggestions based on booking status
 */
function getSmartSuggestions(
  templates: QuickReplyTemplate[],
  context: BookingContext | null
): QuickReplyTemplate[] {
  if (!context) {
    // Without context, return general templates
    return templates.filter((t) => t.category === "general" || !t.relevantStatuses).slice(0, 3);
  }

  // Filter templates relevant to current status
  const relevant = templates.filter(
    (t) => !t.relevantStatuses || t.relevantStatuses.includes(context.status)
  );

  // Sort by priority and return top suggestions
  return relevant.sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 4);
}

// ============================================================================
// Category Configuration
// ============================================================================

type CategoryConfig = {
  label: string;
  icon: HugeIcon;
};

const CATEGORY_CONFIG: Record<QuickReplyCategory, CategoryConfig> = {
  suggested: { label: "Suggested", icon: Rocket01Icon },
  acceptance: { label: "Accept/Decline", icon: CheckmarkCircle02Icon },
  questions: { label: "Questions", icon: HelpCircleIcon },
  scheduling: { label: "Scheduling", icon: Calendar03Icon },
  in_service: { label: "In Service", icon: Clock01Icon },
  completion: { label: "Completion", icon: CheckmarkCircle02Icon },
  general: { label: "General", icon: Message01Icon },
};

// ============================================================================
// Main Component
// ============================================================================

export function QuickReplies({ onSelectReply, bookingContext, className }: QuickRepliesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickReplyCategory | "all">("all");

  // Get smart suggestions based on context
  const smartSuggestions = useMemo(
    () => getSmartSuggestions(BASE_TEMPLATES, bookingContext || null),
    [bookingContext]
  );

  // Get available categories based on booking status
  const availableCategories = useMemo(() => {
    const categories = new Set<QuickReplyCategory>(["general"]);

    if (!bookingContext) {
      categories.add("acceptance");
      categories.add("questions");
      categories.add("scheduling");
      return Array.from(categories);
    }

    switch (bookingContext.status) {
      case "pending":
        categories.add("acceptance");
        categories.add("questions");
        categories.add("scheduling");
        break;
      case "confirmed":
        categories.add("questions");
        categories.add("scheduling");
        categories.add("in_service");
        break;
      case "in_progress":
        categories.add("in_service");
        categories.add("completion");
        break;
      case "completed":
        categories.add("completion");
        break;
      default:
        // For cancelled bookings or unknown statuses, only show general templates
        break;
    }

    return Array.from(categories);
  }, [bookingContext]);

  // Filter templates by selected category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return BASE_TEMPLATES.filter(
        (t) =>
          !(t.relevantStatuses && bookingContext) ||
          t.relevantStatuses.includes(bookingContext.status)
      );
    }
    return BASE_TEMPLATES.filter(
      (t) =>
        t.category === selectedCategory &&
        (!(t.relevantStatuses && bookingContext) ||
          t.relevantStatuses.includes(bookingContext.status))
    );
  }, [selectedCategory, bookingContext]);

  const handleSelectReply = (template: QuickReplyTemplate) => {
    const filledMessage = fillTemplate(template.message, bookingContext || null);
    onSelectReply(filledMessage);
    setIsExpanded(false);
  };

  // Collapsed state - show trigger button
  if (!isExpanded) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2",
            "font-medium text-neutral-700 text-sm shadow-sm transition-all",
            "hover:border-rausch-200 hover:bg-rausch-50/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
          )}
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={Message01Icon} />
          <span className={geistSans.className}>Quick Replies</span>
          <HugeiconsIcon className="h-4 w-4" icon={ArrowDown01Icon} />
        </button>

        {/* Smart suggestion chips (collapsed view) */}
        {bookingContext && smartSuggestions.length > 0 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            {smartSuggestions.slice(0, 2).map((suggestion) => (
              <button
                className={cn(
                  "rounded-full border border-rausch-200 bg-rausch-50 px-3 py-1",
                  "font-medium text-rausch-700 text-xs transition-all",
                  "hover:bg-rausch-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
                )}
                key={suggestion.id}
                onClick={() => handleSelectReply(suggestion)}
                type="button"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Expanded state - show full panel
  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-4 shadow-sm", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            Quick Reply Templates
          </h3>
          {bookingContext && (
            <Badge
              className="border-rausch-200 bg-rausch-50 text-rausch-700"
              size="sm"
              variant="outline"
            >
              {bookingContext.status.replace("_", " ")}
            </Badge>
          )}
        </div>
        <button
          className="rounded-lg p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={ArrowUp01Icon} />
        </button>
      </div>

      {/* Smart Suggestions (if context available) */}
      {bookingContext && smartSuggestions.length > 0 && (
        <div className="mb-4">
          <p
            className={cn(
              "mb-2 font-medium text-neutral-500 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            Suggested for this conversation
          </p>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((suggestion) => (
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-rausch-200 bg-rausch-50 px-3 py-1.5",
                  "font-medium text-rausch-700 text-xs transition-all",
                  "hover:bg-rausch-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
                )}
                key={suggestion.id}
                onClick={() => handleSelectReply(suggestion)}
                type="button"
              >
                {suggestion.icon && (
                  <HugeiconsIcon className="h-3.5 w-3.5" icon={suggestion.icon} />
                )}
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-1">
        <CategoryPill
          isActive={selectedCategory === "all"}
          label="All"
          onClick={() => setSelectedCategory("all")}
        />
        {availableCategories.map((category) => (
          <CategoryPill
            icon={CATEGORY_CONFIG[category].icon}
            isActive={selectedCategory === category}
            key={category}
            label={CATEGORY_CONFIG[category].label}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            onClick={() => handleSelectReply(template)}
            template={template}
          />
        ))}
      </div>

      <p className={cn("mt-3 text-center text-neutral-500 text-xs", geistSans.className)}>
        Click a template to insert it into your message. Placeholders will be filled automatically.
      </p>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

type CategoryPillProps = {
  label: string;
  icon?: HugeIcon;
  isActive: boolean;
  onClick: () => void;
};

function CategoryPill({ label, icon, isActive, onClick }: CategoryPillProps) {
  return (
    <button
      className={cn(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5",
        "font-medium text-xs transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500",
        isActive
          ? "border-rausch-200 bg-rausch-50 text-rausch-700"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-rausch-200 hover:bg-rausch-50/50"
      )}
      onClick={onClick}
      type="button"
    >
      {icon && (
        <HugeiconsIcon
          className={cn("h-3.5 w-3.5", isActive ? "text-rausch-600" : "text-neutral-400")}
          icon={icon}
        />
      )}
      {label}
    </button>
  );
}

type TemplateCardProps = {
  template: QuickReplyTemplate;
  onClick: () => void;
};

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button
      className={cn(
        "rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-all",
        "hover:border-rausch-200 hover:bg-rausch-50/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="mb-1 flex items-center gap-2">
        {template.icon && (
          <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={template.icon} />
        )}
        <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
          {template.label}
        </span>
      </div>
      <p className="line-clamp-2 text-neutral-600 text-xs">{template.message}</p>
    </button>
  );
}

// ============================================================================
// Utility Hook for Parent Components
// ============================================================================

/**
 * Extract booking context from a conversation for quick replies
 */
export function extractBookingContext(
  conversation: {
    booking?: {
      id: string;
      status: string;
      service?: { name: string } | null;
      scheduled_start?: string;
      scheduled_end?: string;
      address?: string;
    } | null;
    otherParticipant?: {
      full_name?: string;
    } | null;
  } | null
): BookingContext | null {
  if (!conversation?.booking) {
    return null;
  }

  const booking = conversation.booking;

  return {
    id: booking.id,
    status: booking.status as BookingStatus,
    serviceName: booking.service?.name || "service",
    scheduledStart: booking.scheduled_start || new Date().toISOString(),
    scheduledEnd: booking.scheduled_end || new Date().toISOString(),
    customerName: conversation.otherParticipant?.full_name || "Customer",
    address: booking.address,
  };
}
