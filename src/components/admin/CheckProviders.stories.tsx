// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CheckProviders } from "./CheckProviders";

const meta = {
  title: "Admin/Check Providers",
  component: CheckProviders,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckProviders>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
