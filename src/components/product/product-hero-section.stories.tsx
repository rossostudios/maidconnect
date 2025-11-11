// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProductHeroSection } from "./product-hero-section";

const meta = {
  title: "Product/ProductHeroSection",
  component: ProductHeroSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductHeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
