// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SiteNavigation } from "./SiteNavigation";

const meta = {
  title: "Sections/SiteNavigation",
  component: SiteNavigation,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SiteNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
