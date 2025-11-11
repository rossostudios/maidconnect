// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { OnboardingChecklist } from "./OnboardingChecklist";

const meta = {
  title: "Onboarding/OnboardingChecklist",
  component: OnboardingChecklist,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OnboardingChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
