// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RatingPromptModal } from "./Rating";

const meta = {
  title: "Reviews/RatingPromptModal",
  component: RatingPromptModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RatingPromptModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
