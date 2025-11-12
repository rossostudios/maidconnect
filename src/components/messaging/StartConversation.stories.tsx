// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { StartConversationButton } from "./StartConversation";

const meta = {
  title: "Communication/Messaging/StartConversationButton",
  component: StartConversationButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StartConversationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bookingId: "booking-123",
    label: "Message",
  },
};

export const CustomLabel: Story = {
  args: {
    bookingId: "booking-456",
    label: "Start Chat",
  },
};

export const WithCustomClass: Story = {
  args: {
    bookingId: "booking-789",
    label: "Contact",
    className: "w-full",
  },
};
