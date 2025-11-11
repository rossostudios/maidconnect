// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ViewToggle } from "./view-toggle";

const meta = {
  title: "Professionals/ViewToggle",
  component: ViewToggle,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ViewToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
