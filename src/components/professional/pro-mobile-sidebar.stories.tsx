// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProMobileSidebar } from "./pro-mobile-sidebar";

const meta = {
  title: "Professional/ProMobileSidebar",
  component: ProMobileSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProMobileSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
