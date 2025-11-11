// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationPermissionPrompt } from "./notification-permission-prompt";

const meta = {
  title: "Notifications/NotificationPermissionPrompt",
  component: NotificationPermissionPrompt,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationPermissionPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
