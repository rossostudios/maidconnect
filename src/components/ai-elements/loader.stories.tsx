// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./loader";

const meta = {
  title: "Ai-element./loader",
  component: Loader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
