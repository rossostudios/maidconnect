// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BackgroundCheckProviderSettings } from "./background-check-provider-settings";

const meta = {
  title: "Admin/Background Check Provider Settings",
  component: BackgroundCheckProviderSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BackgroundCheckProviderSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
