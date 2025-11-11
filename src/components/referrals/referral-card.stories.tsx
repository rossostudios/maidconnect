// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ReferralCard } from "./referral-card";

const meta = {
  title: "Referrals/ReferralCard",
  component: ReferralCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReferralCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
