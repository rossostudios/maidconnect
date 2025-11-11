// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapBoard } from "./roadmap-board";

const meta = {
  title: "Roadmap/RoadmapBoard",
  component: RoadmapBoard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
