// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UserModerationModal } from "./user-moderation-modal";

const meta = {
  title: "Admin/User Moderation Modal",
  component: UserModerationModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserModerationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
