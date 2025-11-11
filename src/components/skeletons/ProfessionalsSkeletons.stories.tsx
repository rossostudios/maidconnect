// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalsSkeletons } from "./ProfessionalsSkeletons";

const meta = {
  title: "Skeletons/ProfessionalsSkeletons",
  component: ProfessionalsSkeletons,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalsSkeletons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
