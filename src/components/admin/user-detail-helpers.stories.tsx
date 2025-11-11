// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { UserProfileHeader } from "./user-detail-helpers";

const meta = {
  title: "Admin/User Profile Header",
  component: UserProfileHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
