// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UnexpectedError } from "./unexpected-error";

const meta = {
  title: "Communication/Feedback/UnexpectedError",
  component: UnexpectedError,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UnexpectedError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: "Unable to process your request. Please check your internet connection and try again.",
  },
};
