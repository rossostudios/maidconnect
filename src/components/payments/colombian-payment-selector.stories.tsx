// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ColombianPaymentSelector } from "./colombian-payment-selector";

const meta = {
  title: "Payments/ColombianPaymentSelector",
  component: ColombianPaymentSelector,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Colombian payment method selector prioritizing local payment options (PSE, Nequi) based on market research showing 87% mobile adoption.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selectedMethod: {
      control: "select",
      options: ["pse", "nequi", "bancolombia", "card", undefined],
      description: "Pre-selected payment method",
    },
    onPaymentMethodSelect: {
      description: "Callback when payment method is selected",
    },
  },
} satisfies Meta<typeof ColombianPaymentSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onPaymentMethodSelect: fn(),
  },
};

export const PSESelected: Story = {
  args: {
    selectedMethod: "pse",
    onPaymentMethodSelect: fn(),
  },
};

export const NequiSelected: Story = {
  args: {
    selectedMethod: "nequi",
    onPaymentMethodSelect: fn(),
  },
};

export const CardSelected: Story = {
  args: {
    selectedMethod: "card",
    onPaymentMethodSelect: fn(),
  },
};
