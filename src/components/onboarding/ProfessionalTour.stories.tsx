// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalTour } from "./ProfessionalTour";

const meta = {
  title: "Onboarding/ProfessionalTour",
  component: ProfessionalTour,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalTour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
