// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SiteFooter } from "./site-footer";

const meta = {
  title: "Sections/SiteFooter",
  component: SiteFooter,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
