// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BundleCard } from "./bundle-card";

const meta = {
  title: "Bundles/BundleCard",
  component: BundleCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BundleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
