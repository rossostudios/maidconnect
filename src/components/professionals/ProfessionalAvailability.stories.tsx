// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalAvailabilityCalendar } from "./ProfessionalAvailability";

const meta = {
  title: "Professionals/ProfessionalAvailabilityCalendar",
  component: ProfessionalAvailabilityCalendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalAvailabilityCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
