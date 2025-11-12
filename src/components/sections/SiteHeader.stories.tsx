// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Sections/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
