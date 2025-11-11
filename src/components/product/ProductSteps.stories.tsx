// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProductStepsSection } from "./ProductSteps";

const meta = {
  title: "Product/ProductStepsSection",
  component: ProductStepsSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductStepsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
