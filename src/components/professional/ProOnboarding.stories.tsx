// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProOnboardingBadge } from "./ProOnboarding";

const meta = {
  title: "Professional/ProOnboardingBadge",
  component: ProOnboardingBadge,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProOnboardingBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
