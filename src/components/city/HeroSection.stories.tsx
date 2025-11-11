// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./HeroSection";

const meta = {
  title: "City/HeroSection",
  component: HeroSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
