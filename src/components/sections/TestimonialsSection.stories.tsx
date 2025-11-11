// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TestimonialsSection } from "./TestimonialsSection";

const meta = {
  title: "Sections/TestimonialsSection",
  component: TestimonialsSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TestimonialsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
