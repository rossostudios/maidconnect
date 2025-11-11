// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RecurringPlansManager } from "./RecurringPlans";

const meta = {
  title: "Customer/RecurringPlansManager",
  component: RecurringPlansManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RecurringPlansManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
