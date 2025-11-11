// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PricingControlsManager } from "./pricing-controls-manager";

const meta = {
  title: "Admin/Pricing Controls Manager",
  component: PricingControlsManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PricingControlsManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
