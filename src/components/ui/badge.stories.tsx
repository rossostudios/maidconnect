// @ts-nocheck

import { AlertCircleIcon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

/**
 * Casaora Badge Component
 *
 * Design System:
 * - Status indicators for bookings, professionals, etc.
 * - Supports icons, dots, and multiple semantic variants
 * - Three sizes: sm, md (default), lg
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Versatile status and label component. Supports icons, dots, and multiple variants including booking statuses.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "success",
        "warning",
        "danger",
        "info",
        "outline",
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      description: "Visual style variant",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Badge size",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    dot: {
      control: "boolean",
      description: "Show dot indicator",
    },
    dotColor: {
      control: "color",
      description: "Custom dot color (overrides default)",
    },
    children: {
      control: "text",
      description: "Badge content",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge - Neutral gray style
 */
export const Default: Story = {
  args: {
    children: "Default",
    variant: "default",
    size: "md",
  },
};

/**
 * Primary badge - Brand orange
 */
export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "primary",
    size: "md",
  },
};

/**
 * Secondary badge - Stone gray
 */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
    size: "md",
  },
};

/**
 * Success badge - Green for positive states
 */
export const Success: Story = {
  args: {
    children: "Success",
    variant: "success",
    size: "md",
  },
};

/**
 * Warning badge - Yellow for attention states
 */
export const Warning: Story = {
  args: {
    children: "Warning",
    variant: "warning",
    size: "md",
  },
};

/**
 * Danger badge - Red for errors/cancellations
 */
export const Danger: Story = {
  args: {
    children: "Danger",
    variant: "danger",
    size: "md",
  },
};

/**
 * Info badge - Blue for informational states
 */
export const Info: Story = {
  args: {
    children: "Info",
    variant: "info",
    size: "md",
  },
};

/**
 * Outline badge - Transparent with border
 */
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
    size: "md",
  },
};

// Booking Status Variants
/**
 * Pending booking status
 */
export const Pending: Story = {
  args: {
    children: "Pending",
    variant: "pending",
    size: "md",
    dot: true,
  },
};

/**
 * Confirmed booking status
 */
export const Confirmed: Story = {
  args: {
    children: "Confirmed",
    variant: "confirmed",
    size: "md",
    icon: CheckmarkCircle02Icon,
  },
};

/**
 * In Progress booking status
 */
export const InProgress: Story = {
  args: {
    children: "In Progress",
    variant: "in_progress",
    size: "md",
    dot: true,
  },
};

/**
 * Completed booking status
 */
export const Completed: Story = {
  args: {
    children: "Completed",
    variant: "completed",
    size: "md",
    icon: CheckmarkCircle02Icon,
  },
};

/**
 * Cancelled booking status
 */
export const Cancelled: Story = {
  args: {
    children: "Cancelled",
    variant: "cancelled",
    size: "md",
    icon: AlertCircleIcon,
  },
};

// Size Variations
/**
 * Small badge
 */
export const Small: Story = {
  args: {
    children: "Small",
    variant: "primary",
    size: "sm",
  },
};

/**
 * Medium badge (default)
 */
export const Medium: Story = {
  args: {
    children: "Medium",
    variant: "primary",
    size: "md",
  },
};

/**
 * Large badge
 */
export const Large: Story = {
  args: {
    children: "Large",
    variant: "primary",
    size: "lg",
  },
};

// Special Cases
/**
 * Badge with icon
 */
export const WithIcon: Story = {
  args: {
    children: "With Icon",
    variant: "success",
    size: "md",
    icon: CheckmarkCircle02Icon,
  },
};

/**
 * Badge with dot indicator
 */
export const WithDot: Story = {
  args: {
    children: "Active",
    variant: "success",
    size: "md",
    dot: true,
  },
};

/**
 * Badge with custom dot color
 */
export const WithCustomDot: Story = {
  args: {
    children: "Custom Dot",
    variant: "default",
    size: "md",
    dot: true,
    dotColor: "bg-orange-500",
  },
};

// Showcase Stories
/**
 * All badge variants
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * Booking status badges
 */
export const BookingStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Pending:</span>
        <Badge dot variant="pending">
          Pending
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Confirmed:</span>
        <Badge icon={CheckmarkCircle02Icon} variant="confirmed">
          Confirmed
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">In Progress:</span>
        <Badge icon={Clock01Icon} variant="in_progress">
          In Progress
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Completed:</span>
        <Badge icon={CheckmarkCircle02Icon} variant="completed">
          Completed
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Cancelled:</span>
        <Badge icon={AlertCircleIcon} variant="cancelled">
          Cancelled
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Small:</span>
        <Badge size="sm" variant="primary">
          Small
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Medium:</span>
        <Badge size="md" variant="primary">
          Medium
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Large:</span>
        <Badge size="lg" variant="primary">
          Large
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
