// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RecentlyViewed } from "./RecentlyViewed";

const meta = {
  title: "Professionals/RecentlyViewed",
  component: RecentlyViewed,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RecentlyViewed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
