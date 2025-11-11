// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PendingRatingsList } from "./PendingRatings";

const meta = {
  title: "Reviews/PendingRatingsList",
  component: PendingRatingsList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PendingRatingsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
