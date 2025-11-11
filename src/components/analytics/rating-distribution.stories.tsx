// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RatingDistribution } from "./rating-distribution";

const meta = {
  title: "Analytics/RatingDistribution",
  component: RatingDistribution,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RatingDistribution>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
