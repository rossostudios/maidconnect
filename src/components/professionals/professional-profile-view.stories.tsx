// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalProfileView } from "./professional-profile-view";

const meta = {
  title: "Professionals/ProfessionalProfileView",
  component: ProfessionalProfileView,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
