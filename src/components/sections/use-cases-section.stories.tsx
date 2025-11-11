// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UseCasesSection } from "./use-cases-section";

const meta = {
  title: "Sections/UseCasesSection",
  component: UseCasesSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UseCasesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
