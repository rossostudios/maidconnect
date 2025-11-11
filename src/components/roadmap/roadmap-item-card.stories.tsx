// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapItemCard } from "./roadmap-item-card";

const meta = {
  title: "Roadmap/RoadmapItemCard",
  component: RoadmapItemCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
