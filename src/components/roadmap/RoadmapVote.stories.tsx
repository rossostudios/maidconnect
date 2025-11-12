// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RoadmapVoteButton } from "./RoadmapVote";

const meta = {
  title: "Roadmap/RoadmapVoteButton",
  component: RoadmapVoteButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoadmapVoteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
