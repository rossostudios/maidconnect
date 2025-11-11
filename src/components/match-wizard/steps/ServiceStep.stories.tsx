// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceStep } from "./ServiceStep";

const meta = {
  title: "Match-wizard/ServiceStep",
  component: ServiceStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
