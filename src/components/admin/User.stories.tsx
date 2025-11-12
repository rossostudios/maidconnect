// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UserManagementTable } from "./User";

const meta = {
  title: "Admin/User Management Table",
  component: UserManagementTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserManagementTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
