// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MessagingInterface } from "./MessagingInterface";

const meta = {
  title: "Messaging/MessagingInterface",
  component: MessagingInterface,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MessagingInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
