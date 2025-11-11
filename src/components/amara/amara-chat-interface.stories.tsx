// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraChatInterface } from "./amara-chat-interface";

const meta = {
  title: "Amara/AmaraChatInterface",
  component: AmaraChatInterface,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraChatInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
