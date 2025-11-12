// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ConciergeSection } from "./ConciergeSection";

const meta = {
  title: "Sections/ConciergeSection",
  component: ConciergeSection,
  parameters: {
    layout: "fullwidth",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConciergeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
