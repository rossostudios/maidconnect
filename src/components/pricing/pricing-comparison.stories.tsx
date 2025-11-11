// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PricingComparison } from "./pricing-comparison";

const meta = {
  title: "Pricing/PricingComparison",
  component: PricingComparison,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PricingComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
