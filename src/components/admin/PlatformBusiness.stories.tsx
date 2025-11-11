// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PlatformBusinessSettings } from "./PlatformBusiness";

const meta = {
  title: "Admin/Platform Business Settings",
  component: PlatformBusinessSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlatformBusinessSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
