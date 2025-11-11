// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BackgroundCheckDetailModal } from "./background-check-detail-modal";

const meta = {
  title: "Admin/Background Check Detail Modal",
  component: BackgroundCheckDetailModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BackgroundCheckDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
