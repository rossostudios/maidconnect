// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PricingFaqSection } from "./pricing-faq-section";

const meta = {
  title: "Pricing/PricingFaqSection",
  component: PricingFaqSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PricingFaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
