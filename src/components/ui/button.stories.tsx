// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

/**
 * MaidConnect Button Component
 *
 * Design System:
 * - Brand Colors: Orange (#F44A22), Silver (#FEF8E8), Grey (#E4E2E3), Midnight (#161616), Stone (#A8AAAC)
 * - Typography: Inter font
 * - Style: Clean, minimal, professional
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component following the MaidConnect design system. Supports multiple variants (primary, secondary, ghost, card, luxury), sizes (sm, md, lg), icons, and keyboard shortcuts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "card", "luxury"],
      description: "Visual style variant",
      table: {
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    icon: {
      control: "boolean",
      description: "Show arrow icon",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    kbd: {
      control: "text",
      description: 'Keyboard shortcut to display (e.g., "⌘K")',
    },
    label: {
      control: "text",
      description: "Button text",
    },
    href: {
      control: "text",
      description: "Link destination",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button - Main call-to-action
 * Uses orange (#F44A22) background with white text
 */
export const Primary: Story = {
  args: {
    label: "Get Started",
    href: "/en",
    variant: "primary",
    size: "md",
    icon: true,
  },
};

/**
 * Secondary button - Less prominent actions
 * Orange border with transparent background
 */
export const Secondary: Story = {
  args: {
    label: "Learn More",
    href: "/en/about",
    variant: "secondary",
    size: "md",
    icon: true,
  },
};

/**
 * Ghost button - Subtle actions
 * Transparent with hover state
 */
export const Ghost: Story = {
  args: {
    label: "View Details",
    href: "/en/professionals",
    variant: "ghost",
    size: "md",
  },
};

/**
 * Card button - Full-width actions in cards
 * Prominent call-to-action for booking flows
 */
export const Card: Story = {
  args: {
    label: "Book Now",
    href: "/en/professionals",
    variant: "card",
    size: "lg",
    icon: true,
  },
  parameters: {
    layout: "padded",
  },
};

/**
 * Luxury button - Premium services
 * Inverted colors for high-end offerings
 */
export const Luxury: Story = {
  args: {
    label: "Premium Service",
    href: "/en/pricing",
    variant: "luxury",
    size: "lg",
    icon: true,
  },
};

// Size Variations
/**
 * Small button - Compact spaces
 */
export const Small: Story = {
  args: {
    label: "Small Button",
    href: "/en",
    variant: "primary",
    size: "sm",
    icon: true,
  },
};

/**
 * Medium button - Standard size (default)
 */
export const Medium: Story = {
  args: {
    label: "Medium Button",
    href: "/en",
    variant: "primary",
    size: "md",
    icon: true,
  },
};

/**
 * Large button - Prominent actions
 */
export const Large: Story = {
  args: {
    label: "Large Button",
    href: "/en",
    variant: "primary",
    size: "lg",
    icon: true,
  },
};

// Special Cases
/**
 * Button with keyboard shortcut
 * Common for search and navigation
 */
export const WithKeyboardShortcut: Story = {
  args: {
    label: "Search",
    href: "/en/professionals",
    variant: "secondary",
    size: "md",
    kbd: "⌘K",
  },
};

/**
 * Button without icon
 * Cleaner look for certain contexts
 */
export const WithoutIcon: Story = {
  args: {
    label: "Simple Button",
    href: "/en",
    variant: "primary",
    size: "md",
    icon: false,
  },
};

// Showcase Stories
/**
 * All button variants side-by-side
 * Useful for design review and consistency checks
 */
export const AllVariants: Story = {
  args: {} as any,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Primary:</span>
        <Button href="/en" icon label="Primary" size="md" variant="primary" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Secondary:</span>
        <Button href="/en" icon label="Secondary" size="md" variant="secondary" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Ghost:</span>
        <Button href="/en" icon label="Ghost" size="md" variant="ghost" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Card:</span>
        <Button href="/en" icon label="Card" size="md" variant="card" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-stone">Luxury:</span>
        <Button href="/en" icon label="Luxury" size="md" variant="luxury" />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * All button sizes comparison
 * Shows how buttons scale across different sizes
 */
export const AllSizes: Story = {
  args: {} as any,
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Small:</span>
        <Button href="/en" icon label="Small" size="sm" variant="primary" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Medium:</span>
        <Button href="/en" icon label="Medium" size="md" variant="primary" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm text-stone">Large:</span>
        <Button href="/en" icon label="Large" size="lg" variant="primary" />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
