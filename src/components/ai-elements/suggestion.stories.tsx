// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Suggestion } from "./suggestion";

const meta = {
  title: "Ai-element./suggestion",
  component: Suggestion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Suggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
