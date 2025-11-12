// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CheckoutSummary } from "./CheckoutSummary";

const meta = {
  title: "Bookings/CheckoutSummary",
  component: CheckoutSummary,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckoutSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
