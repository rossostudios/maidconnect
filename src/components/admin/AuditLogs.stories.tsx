// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogsDashboard } from "./AuditLogs";

const meta = {
  title: "Admin/Audit Logs Dashboard",
  component: AuditLogsDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuditLogsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
