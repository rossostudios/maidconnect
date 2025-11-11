// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TourTooltip } from "./TourTooltip";

const meta = {
  title: "Onboarding/TourTooltip",
  component: TourTooltip,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TourTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
