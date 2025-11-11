// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { OperationsSection } from "./operations-section";

const meta = {
  title: "Sections/OperationsSection",
  component: OperationsSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OperationsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
