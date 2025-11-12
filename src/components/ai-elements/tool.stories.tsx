// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Tool } from "./tool";

const meta = {
  title: "Ai-element./tool",
  component: Tool,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
