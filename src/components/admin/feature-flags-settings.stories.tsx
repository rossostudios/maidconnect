// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeatureFlagsSettings } from "./feature-flags-settings";

const meta = {
  title: "Admin/Feature Flags Settings",
  component: FeatureFlagsSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeatureFlagsSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
