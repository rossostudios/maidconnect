// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapCard } from "./RoadmapCard";

const meta = {
  title: "Roadmap/RoadmapCard",
  component: RoadmapCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
