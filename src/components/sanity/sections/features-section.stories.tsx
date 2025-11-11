// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeaturesSection } from "./features-section";

const meta = {
  title: "Sanity/FeaturesSection",
  component: FeaturesSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeaturesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
