// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalReviews } from "./ProfessionalReviews";

const meta = {
  title: "Professionals/ProfessionalReviews",
  component: ProfessionalReviews,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
