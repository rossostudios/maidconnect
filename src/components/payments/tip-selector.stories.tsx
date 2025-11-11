// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { TipSelector } from "./tip-selector";

const meta = {
  title: "Payments/TipSelector",
  component: TipSelector,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Smart tip selector with preset percentages and custom amount option. Based on research showing preset suggestions increase tips by 8-15%.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    baseAmount: {
      control: "number",
      description: "Base amount before tip (in cents)",
    },
    currency: {
      control: "select",
      options: ["COP", "USD"],
      description: "Currency code",
    },
    initialTip: {
      control: "number",
      description: "Initial tip amount",
    },
  },
} satisfies Meta<typeof TipSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    baseAmount: 150_000,
    currency: "COP",
    onTipChange: fn(),
    initialTip: 0,
  },
};

export const WithInitialTip: Story = {
  args: {
    baseAmount: 150_000,
    currency: "COP",
    onTipChange: fn(),
    initialTip: 30_000,
  },
};

export const SmallAmount: Story = {
  args: {
    baseAmount: 50_000,
    currency: "COP",
    onTipChange: fn(),
  },
};

export const LargeAmount: Story = {
  args: {
    baseAmount: 500_000,
    currency: "COP",
    onTipChange: fn(),
  },
};
