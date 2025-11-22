import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

/**
 * Button Component Stories
 *
 * Showcases the Button component variants from the Lia Design System.
 * Uses React Aria for accessibility and Tailwind CSS for styling.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component following the Lia Design System. Supports multiple variants (default, outline, secondary, ghost, link), sizes (sm, default, lg, icon), and composition via asChild.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Visual style variant",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Button size",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the button",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: "text",
      description: "Button content",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button - Primary orange CTA
 */
export const Default: Story = {
  args: {
    children: "Get Started",
    variant: "default",
    size: "default",
  },
};

/**
 * Outline button - Border with orange accent on hover
 */
export const Outline: Story = {
  args: {
    children: "Learn More",
    variant: "outline",
    size: "default",
  },
};

/**
 * Secondary button - Neutral background
 */
export const Secondary: Story = {
  args: {
    children: "Cancel",
    variant: "secondary",
    size: "default",
  },
};

/**
 * Ghost button - Transparent with hover state
 */
export const Ghost: Story = {
  args: {
    children: "View Details",
    variant: "ghost",
    size: "default",
  },
};

/**
 * Link button - Text-only with orange accent
 */
export const Link: Story = {
  args: {
    children: "Read more",
    variant: "link",
    size: "default",
  },
};

/**
 * Destructive button - For dangerous actions
 */
export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
    size: "default",
  },
};

// Size Variations
/**
 * Small button - Compact spaces
 */
export const Small: Story = {
  args: {
    children: "Small Button",
    variant: "default",
    size: "sm",
  },
};

/**
 * Large button - Prominent actions
 */
export const Large: Story = {
  args: {
    children: "Large Button",
    variant: "default",
    size: "lg",
  },
};

/**
 * Icon button - Square for icon-only buttons
 */
export const Icon: Story = {
  args: {
    children: "X",
    variant: "outline",
    size: "icon",
  },
};

/**
 * Disabled button - Non-interactive state
 */
export const Disabled: Story = {
  args: {
    children: "Disabled",
    variant: "default",
    size: "default",
    isDisabled: true,
  },
};

// Showcase Stories
/**
 * All button variants side-by-side
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Default:</span>
        <Button variant="default">Default</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Outline:</span>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Secondary:</span>
        <Button variant="secondary">Secondary</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Ghost:</span>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Link:</span>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-neutral-500 text-sm">Destructive:</span>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * All button sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <span className="w-20 text-neutral-500 text-sm">Small:</span>
        <Button size="sm">Small</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-neutral-500 text-sm">Default:</span>
        <Button size="default">Default</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-neutral-500 text-sm">Large:</span>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-neutral-500 text-sm">Icon:</span>
        <Button size="icon">+</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
