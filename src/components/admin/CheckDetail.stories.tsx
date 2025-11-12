// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CheckDetail } from "./CheckDetail";

const meta = {
  title: "Admin/Check Detail",
  component: CheckDetail,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
