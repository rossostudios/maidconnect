// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookingPipeline } from "./booking-pipeline";

const meta = {
  title: "Dashboard/BookingPipeline",
  component: BookingPipeline,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingPipeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    chromatic: { delay: 300 },
  },
};

export const WithData: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "BookingPipeline component showing booking lifecycle stages with charts and metrics.",
      },
    },
  },
};
