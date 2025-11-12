// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminSettingsTabs } from "./SettingsTabs";

const meta = {
  title: "Admin/Admin Settings Tabs",
  component: AdminSettingsTabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminSettingsTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
