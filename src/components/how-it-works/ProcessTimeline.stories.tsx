// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProcessTimeline } from "./ProcessTimeline";

const meta = {
  title: "How-it-works/ProcessTimeline",
  component: ProcessTimeline,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProcessTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
