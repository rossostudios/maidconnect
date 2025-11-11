// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerTour } from "./customer-tour";

const meta = {
  title: "Onboarding/CustomerTour",
  component: CustomerTour,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerTour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
