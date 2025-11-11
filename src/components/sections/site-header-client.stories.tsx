// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeaderClient } from "./site-header-client";

const meta = {
  title: "Sections/SiteHeaderClient",
  component: SiteHeaderClient,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isAuthenticated: {
      control: "boolean",
      description: "Whether user is authenticated",
    },
  },
} satisfies Meta<typeof SiteHeaderClient>;

export default meta;
type Story = StoryObj<typeof meta>;

// Authenticated user
export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    dashboardHref: "/dashboard",
  },
};

// Unauthenticated user
export const Unauthenticated: Story = {
  args: {
    isAuthenticated: false,
  },
};
