// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProductFeatureCard } from "./product-feature-card";

const meta = {
  title: "Product/ProductFeatureCard",
  component: ProductFeatureCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductFeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
