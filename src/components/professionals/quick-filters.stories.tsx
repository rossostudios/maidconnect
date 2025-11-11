// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { QuickFilters } from "./quick-filters";

const meta = {
  title: "Professionals/QuickFilters",
  component: QuickFilters,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof QuickFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
