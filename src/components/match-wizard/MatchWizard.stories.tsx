// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MatchWizard } from "./MatchWizard";

const meta = {
  title: "Match-wizard/MatchWizard",
  component: MatchWizard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MatchWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
