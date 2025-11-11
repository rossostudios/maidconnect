// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BundleManager } from "./BundleManager";

const meta = {
  title: "Bundles/BundleManager",
  component: BundleManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BundleManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
