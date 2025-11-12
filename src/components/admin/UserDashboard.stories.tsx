// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UserManagementDashboard } from "./UserDashboard";

const meta = {
  title: "Admin/User Management Dashboard",
  component: UserManagementDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserManagementDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
