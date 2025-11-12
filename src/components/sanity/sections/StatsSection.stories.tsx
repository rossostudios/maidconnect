// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { StatsSection } from "./StatsSection";

const meta = {
  title: "Sanity/StatsSection",
  component: StatsSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
