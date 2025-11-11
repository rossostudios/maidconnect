// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CompactPrice, PriceBreakdown } from "./price-breakdown";

const meta = {
  title: "Pricing/PriceBreakdown",
  component: PriceBreakdown,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PriceBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    baseAmount: 150_000,
    addonsTotal: 30_000,
    hours: 3,
    hourlyRate: 50_000,
    showPlatformFee: false,
  },
};

export const WithPlatformFee: Story = {
  args: {
    baseAmount: 150_000,
    addonsTotal: 30_000,
    hours: 3,
    hourlyRate: 50_000,
    showPlatformFee: true,
  },
};

export const CompactPriceStory: Story = {
  render: () => <CompactPrice hourlyRate={50_000} showBreakdown={true} />,
};
