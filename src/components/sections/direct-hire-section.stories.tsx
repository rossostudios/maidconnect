// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DirectHireSection } from "./DirectHireSection";

const meta = {
  title: "Sections/DirectHireSection",
  component: DirectHireSection,
  parameters: {
    layout: "fullwidth",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DirectHireSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
