// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSwitcher } from "./language-switcher";

const meta = {
  title: "Navigation/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Refined language switcher with Lia Design System aesthetics. Features a sliding orange indicator, sharp corners, and Geist Sans typography. Zero-radius segmented control that matches Casaora's brand.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default language switcher with segmented control design.
 * Orange sliding indicator shows active language.
 */
export const Default: Story = {};

/**
 * Language switcher in header context - matches navigation styling.
 */
export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-6 border-neutral-200 border-b bg-white px-8 py-4">
        <span className="font-medium text-neutral-700 text-sm">Language:</span>
        <Story />
      </div>
    ),
  ],
};

/**
 * Language switcher in footer context - works on darker backgrounds.
 */
export const InFooter: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center gap-6 bg-neutral-900 px-8 py-6">
        <span className="font-medium text-neutral-400 text-sm">Language:</span>
        <Story />
      </div>
    ),
  ],
};

/**
 * English active state - white text on orange background.
 */
export const EnglishActive: Story = {
  parameters: {
    locale: "en",
  },
};

/**
 * Spanish active state - white text on orange background.
 */
export const SpanishActive: Story = {
  parameters: {
    locale: "es",
  },
};

/**
 * Compact version for mobile navigation or tight spaces.
 */
export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-3 bg-white p-3">
        <Story />
      </div>
    ),
  ],
};
