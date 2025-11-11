// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationsSheet } from "./NotificationsSheet";

const meta = {
  title: "Notifications/NotificationsSheet",
  component: NotificationsSheet,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
