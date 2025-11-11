// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalVettingDashboard } from "./ProfessionalVetting";

const meta = {
  title: "Admin/Professional Vetting Dashboard",
  component: ProfessionalVettingDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalVettingDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
