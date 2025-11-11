// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookAgainCard } from "./book-again-card";

const meta = {
  title: "Bookings/BookAgainCard",
  component: BookAgainCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookAgainCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
