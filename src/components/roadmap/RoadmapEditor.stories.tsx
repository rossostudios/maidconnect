// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapEditor } from "./RoadmapEditor";

const meta = {
  title: "Roadmap/RoadmapEditor",
  component: RoadmapEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
