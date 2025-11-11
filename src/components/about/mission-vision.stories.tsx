// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MissionVision } from "./mission-vision";

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
