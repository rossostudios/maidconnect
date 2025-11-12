// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalsFilterSheet } from "./ProfessionalsFilter";

const meta = {
  title: "Professionals/ProfessionalsFilterSheet",
  component: ProfessionalsFilterSheet,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalsFilterSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
