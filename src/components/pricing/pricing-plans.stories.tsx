// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PricingPlans } from "./pricing-plans";

const meta = {
  title: "Pricing/PricingPlans",
  component: PricingPlans,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PricingPlans>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
