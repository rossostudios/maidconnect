// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardFooter } from "./DashboardFooter";

const meta = {
  title: "Navigation/DashboardFooter",
  component: DashboardFooter,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 bg-stone-50 p-8">
          <p className="text-stone-600">Page content goes here...</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const WithUnreadChangelog: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 bg-stone-50 p-8">
          <p className="text-stone-600">Page content with unread changelog badge...</p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    mockData: {
      changelogUnreadCount: 3,
    },
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 bg-stone-50 p-4">
          <p className="text-sm text-stone-600">Mobile view...</p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
