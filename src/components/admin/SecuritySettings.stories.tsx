// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminSecuritySettings } from "./SecuritySettings";

const meta = {
  title: "Admin/Admin Security Settings",
  component: AdminSecuritySettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminSecuritySettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
