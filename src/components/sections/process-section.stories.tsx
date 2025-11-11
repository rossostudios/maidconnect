// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProcessSection } from "./process-section";

const meta = {
  title: "Sections/ProcessSection",
  component: ProcessSection,
  parameters: {
    layout: "fullwidth",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProcessSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
