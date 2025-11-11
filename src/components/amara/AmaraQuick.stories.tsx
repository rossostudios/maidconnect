// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraQuickReplies } from "./AmaraQuick";

const meta = {
  title: "Amara/AmaraQuickReplies",
  component: AmaraQuickReplies,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraQuickReplies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
