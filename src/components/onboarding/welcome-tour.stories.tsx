// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { WelcomeTour } from "./welcome-tour";

const meta = {
  title: "Onboarding/WelcomeTour",
  component: WelcomeTour,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WelcomeTour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
