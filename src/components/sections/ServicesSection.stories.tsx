// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServicesSection } from "./ServicesSection";

const meta = {
  title: "Sections/ServicesSection",
  component: ServicesSection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServicesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
