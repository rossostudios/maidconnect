// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TeamSection } from "./team-section";

const meta = {
  title: "About/TeamSection",
  component: TeamSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TeamSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
