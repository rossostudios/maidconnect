// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminProfileEditor } from "./admin-profile-editor";

const meta = {
  title: "Admin/Admin Profile Editor",
  component: AdminProfileEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminProfileEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
