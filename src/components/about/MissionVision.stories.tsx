// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MissionVision } from "./MissionVision";

const meta = {
  title: "About/MissionVision",
  component: MissionVision,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MissionVision>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
