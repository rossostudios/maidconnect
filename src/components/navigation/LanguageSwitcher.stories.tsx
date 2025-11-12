// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const meta = {
  title: "Navigation/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 border-neutral-200 border-b bg-white p-4">
        <span className="text-neutral-600 text-sm">Language:</span>
        <Story />
      </div>
    ),
  ],
};

export const EnglishActive: Story = {
  parameters: {
    locale: "en",
  },
};

export const SpanishActive: Story = {
  parameters: {
    locale: "es",
  },
};
