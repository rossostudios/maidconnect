// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { LocationStep } from "./LocationStep";

const meta = {
  title: "Match-wizard/LocationStep",
  component: LocationStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LocationStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
