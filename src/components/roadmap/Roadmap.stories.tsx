// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapAdminList } from "./Roadmap";

const meta = {
  title: "Roadmap/RoadmapAdminList",
  component: RoadmapAdminList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapAdminList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
