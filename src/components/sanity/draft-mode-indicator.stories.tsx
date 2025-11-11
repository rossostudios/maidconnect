// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DraftModeIndicator } from "./draft-mode-indicator";

const meta = {
  title: "Sanity/DraftModeIndicator",
  component: DraftModeIndicator,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DraftModeIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
