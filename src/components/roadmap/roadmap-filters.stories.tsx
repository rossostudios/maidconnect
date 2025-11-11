// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapFilters } from "./roadmap-filters";

const meta = {
  title: "Roadmap/RoadmapFilters",
  component: RoadmapFilters,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
