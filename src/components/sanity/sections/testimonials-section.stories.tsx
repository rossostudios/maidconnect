// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TestimonialsSection } from "./testimonials-section";

const meta = {
  title: "Sanity/TestimonialsSection",
  component: TestimonialsSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TestimonialsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
