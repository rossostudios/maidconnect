// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AdminHeader } from "./admin-header";

const meta = {
  title: "Admin/AdminHeader",
  component: AdminHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    userName: {
      control: "text",
      description: "User's display name",
    },
    userEmail: {
      control: "text",
      description: "User's email address",
    },
    avatarUrl: {
      control: "text",
      description: "URL to user's avatar image",
    },
  },
} satisfies Meta<typeof AdminHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with user info
export const Default: Story = {
  args: {
    userName: "Admin User",
    userEmail: "admin@casaora.co",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
};

// Without avatar
export const WithoutAvatar: Story = {
  args: {
    userName: "Admin User",
    userEmail: "admin@casaora.co",
  },
};

// Minimal info
export const MinimalInfo: Story = {
  args: {
    userName: "Admin",
  },
};

// Long email and name
export const LongInformation: Story = {
  args: {
    userName: "Administrator with a Very Long Name",
    userEmail: "administrator.with.very.long.email@casaora.co",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LongName",
  },
};
