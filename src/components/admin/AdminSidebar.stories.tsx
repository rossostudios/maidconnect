// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminSidebar } from "./AdminSidebar";

const meta = {
  title: "Admin/AdminSidebar",
  component: AdminSidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isCollapsed: {
      control: "boolean",
      description: "Whether the sidebar is collapsed",
    },
  },
} satisfies Meta<typeof AdminSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default expanded state
export const Default: Story = {
  args: {
    isCollapsed: false,
  },
};

// Collapsed state
export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
};

// With mock pathname highlighting
export const WithActiveLink: Story = {
  args: {
    isCollapsed: false,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/admin/analytics",
      },
    },
  },
};
