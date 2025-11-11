// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PaymentAuthorizationCard } from "./payment-authorization-card";

const meta = {
  title: "Payments/PaymentAuthorizationCard",
  component: PaymentAuthorizationCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Stripe payment method authorization card for capturing payment details before service delivery.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    hasPaymentMethod: {
      control: "boolean",
      description: "Whether user already has a payment method on file",
    },
  },
} satisfies Meta<typeof PaymentAuthorizationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewPaymentMethod: Story = {
  args: {
    hasPaymentMethod: false,
  },
};

export const ExistingPaymentMethod: Story = {
  args: {
    hasPaymentMethod: true,
  },
};
