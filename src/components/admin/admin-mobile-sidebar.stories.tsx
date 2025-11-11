// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";

const meta = {
  title: "Admin/Admin Mobile Sidebar",
  component: AdminMobileSidebar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminMobileSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
