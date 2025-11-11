// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ResultsStep } from "./results-step";

const meta = {
  title: "Match-wizard/ResultsStep",
  component: ResultsStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ResultsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
