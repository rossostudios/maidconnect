// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { LeadQueue } from "./lead-queue";

const meta = {
  title: "Professional/LeadQueue",
  component: LeadQueue,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LeadQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
