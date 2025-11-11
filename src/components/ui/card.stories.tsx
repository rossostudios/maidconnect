// @ts-nocheck

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import { Card, CardContent, CardFooter, CardHeader, CardImage } from "./card";

/**
 * MaidConnect Card Component
 *
 * Design System:
 * - Flexible container with optional animations
 * - Four variants: default, elevated, outlined, glass
 * - Supports hover effects and can be used as links or buttons
 * - Composable with CardHeader, CardContent, CardFooter, CardImage
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Flexible, animated card component with hover effects. Supports multiple variants and can be composed with header, content, footer, and image sections.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "outlined", "glass"],
      description: "Visual style variant",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    hoverable: {
      control: "boolean",
      description: "Enable hover lift effect",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    asButton: {
      control: "boolean",
      description: "Render as button element",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    href: {
      control: "text",
      description: "Link destination (renders as anchor)",
    },
    disableMotion: {
      control: "boolean",
      description: "Disable motion animations",
      table: {
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card - Standard shadow and border
 */
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Card Title</h3>
        <p className="text-sm text-stone">Subtitle or description</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This is a default card with standard styling. Perfect for general content containers.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Elevated card - Stronger shadow for emphasis
 */
export const Elevated: Story = {
  render: () => (
    <Card className="w-80" variant="elevated">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Elevated Card</h3>
        <p className="text-sm text-stone">Stands out more</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This card has a stronger shadow to create more visual hierarchy.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Outlined card - Thicker border, no shadow
 */
export const Outlined: Story = {
  render: () => (
    <Card className="w-80" variant="outlined">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Outlined Card</h3>
        <p className="text-sm text-stone">Minimal shadow</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This card uses a thicker border with minimal shadow for a cleaner look.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Glass card - Frosted glass effect with backdrop blur
 */
export const Glass: Story = {
  render: () => (
    <div className="relative h-64 w-80 rounded-xl bg-gradient-to-br from-orange to-secondary p-8">
      <Card className="w-full" variant="glass">
        <CardHeader>
          <h3 className="font-semibold text-midnight text-xl">Glass Card</h3>
          <p className="text-sm text-stone">Frosted effect</p>
        </CardHeader>
        <CardContent>
          <p className="text-midnight">This card has a frosted glass effect with backdrop blur.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * Hoverable card - Lifts on hover with animation
 */
export const Hoverable: Story = {
  render: () => (
    <Card className="w-80" hoverable variant="elevated">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Hover Me!</h3>
        <p className="text-sm text-stone">Interactive card</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">Hover over this card to see the lift animation effect.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card as link - Clickable with href
 */
export const AsLink: Story = {
  render: () => (
    <Card className="w-80" hoverable href="/en/professionals">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Clickable Card</h3>
        <p className="text-sm text-stone">Links to /en/professionals</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This entire card is clickable and navigates to a destination.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card as button - Interactive button element
 */
export const AsButton: Story = {
  render: () => (
    <Card asButton className="w-80" hoverable onClick={() => alert("Card clicked!")}>
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Button Card</h3>
        <p className="text-sm text-stone">Click to trigger action</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This card is a button element and triggers an action when clicked.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card with footer - Includes action footer
 */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Card with Footer</h3>
        <p className="text-sm text-stone">Complete card example</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">
          This card includes a footer section for actions or additional information.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone">Last updated: 2 hours ago</span>
          <button
            className="rounded-md bg-orange px-4 py-2 font-semibold text-sm text-white hover:bg-orange/90"
            type="button"
          >
            View Details
          </button>
        </div>
      </CardFooter>
    </Card>
  ),
};

/**
 * Card with image - Includes image section
 */
export const WithImage: Story = {
  render: () => (
    <Card className="w-80" hoverable>
      <CardImage aspectRatio="16/9">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange to-secondary">
          <span className="font-bold text-2xl text-white">Image</span>
        </div>
      </CardImage>
      <CardHeader>
        <h3 className="font-semibold text-midnight text-xl">Card with Image</h3>
        <p className="text-sm text-stone">Includes media content</p>
      </CardHeader>
      <CardContent>
        <p className="text-midnight">Cards can include images with customizable aspect ratios.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * Professional card - Example booking card
 */
export const ProfessionalCard: Story = {
  render: () => (
    <Card className="w-80" hoverable href="/en/professionals/123">
      <CardImage aspectRatio="4/3">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-grey to-stone">
          <span className="font-semibold text-lg text-midnight">Profile Photo</span>
        </div>
      </CardImage>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-midnight">Maria Rodriguez</h3>
            <p className="text-sm text-stone">Professional Cleaner</p>
          </div>
          <Badge icon={CheckmarkCircle02Icon} size="sm" variant="success">
            Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone">Experience:</span>
            <span className="font-semibold text-midnight">5 years</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone">Rating:</span>
            <span className="font-semibold text-midnight">4.9 ⭐</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone">Starting at:</span>
            <span className="font-semibold text-orange">$45/hr</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button
          className="w-full rounded-md bg-orange px-4 py-2.5 font-semibold text-sm text-white hover:bg-orange/90"
          type="button"
        >
          View Profile
        </button>
      </CardFooter>
    </Card>
  ),
};

/**
 * All card variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Card className="w-64">
        <CardHeader>
          <h3 className="font-semibold text-lg text-midnight">Default</h3>
        </CardHeader>
        <CardContent>
          <p className="text-midnight text-sm">Standard card style</p>
        </CardContent>
      </Card>

      <Card className="w-64" variant="elevated">
        <CardHeader>
          <h3 className="font-semibold text-lg text-midnight">Elevated</h3>
        </CardHeader>
        <CardContent>
          <p className="text-midnight text-sm">Stronger shadow</p>
        </CardContent>
      </Card>

      <Card className="w-64" variant="outlined">
        <CardHeader>
          <h3 className="font-semibold text-lg text-midnight">Outlined</h3>
        </CardHeader>
        <CardContent>
          <p className="text-midnight text-sm">Thicker border</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
