// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TimingBudgetStep } from "./timing-budget-step";

const meta = {
  title: "Match-wizard/TimingBudgetStep",
  component: TimingBudgetStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TimingBudgetStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
