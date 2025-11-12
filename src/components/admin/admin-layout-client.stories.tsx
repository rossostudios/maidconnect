// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminLayoutClient } from "./admin-layout-client";

const meta = {
  title: "Admin/AdminLayoutClient",
  component: AdminLayoutClient,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminLayoutClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="p-8 text-stone-900">Admin dashboard content goes here</div>,
  },
};
