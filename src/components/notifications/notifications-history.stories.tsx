// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationsHistory } from "./notifications-history";

const meta = {
  title: "Notifications/NotificationsHistory",
  component: NotificationsHistory,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationsHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
