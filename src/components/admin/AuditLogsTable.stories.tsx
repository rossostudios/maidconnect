// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogsTable } from "./AuditLogsTable";

const meta = {
  title: "Admin/Audit Logs Table",
  component: AuditLogsTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuditLogsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
