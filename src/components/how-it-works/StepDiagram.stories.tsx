// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { StepDiagram } from "./StepDiagram";

const meta = {
  title: "How-it-works/StepDiagram",
  component: StepDiagram,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StepDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
