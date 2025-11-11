// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraOnboardingTooltip } from "./AmaraOnboarding";

const meta = {
  title: "Amara/AmaraOnboardingTooltip",
  component: AmaraOnboardingTooltip,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraOnboardingTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
