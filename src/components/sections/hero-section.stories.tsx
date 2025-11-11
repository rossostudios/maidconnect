// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./hero-section";

const meta = {
  title: "Sections/HeroSection",
  component: HeroSection,
  parameters: {
    layout: "fullwidth",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
