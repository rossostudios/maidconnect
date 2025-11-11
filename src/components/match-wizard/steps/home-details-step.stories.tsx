// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { HomeDetailsStep } from "./home-details-step";

const meta = {
  title: "Match-wizard/HomeDetailsStep",
  component: HomeDetailsStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomeDetailsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
