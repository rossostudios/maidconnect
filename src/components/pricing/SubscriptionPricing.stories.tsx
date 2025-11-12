// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SubscriptionPricingSelector } from "./SubscriptionPricing";

const meta = {
  title: "Pricing/SubscriptionPricingSelector",
  component: SubscriptionPricingSelector,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SubscriptionPricingSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    basePrice: 150_000,
    selectedTier: "none",
    onTierChange: fn(),
  },
};

export const WithRecommended: Story = {
  args: {
    basePrice: 150_000,
    selectedTier: "biweekly",
    recommendedTier: "biweekly",
    onTierChange: fn(),
  },
};
