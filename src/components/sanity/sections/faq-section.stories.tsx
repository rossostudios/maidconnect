// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FaqSection } from "./faq-section";

const meta = {
  title: "Sanity/FaqSection",
  component: FaqSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
