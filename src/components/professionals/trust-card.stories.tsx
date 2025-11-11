// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TrustCard } from "./trust-card";

const meta = {
  title: "Professionals/TrustCard",
  component: TrustCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TrustCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
