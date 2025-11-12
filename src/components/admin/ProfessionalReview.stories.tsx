// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalReviewModal } from "./ProfessionalReview";

const meta = {
  title: "Admin/Professional Review Modal",
  component: ProfessionalReviewModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalReviewModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
