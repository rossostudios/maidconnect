// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PaymentHistoryTable } from "./payment-history-table";

const meta = {
  title: "Payments/PaymentHistoryTable",
  component: PaymentHistoryTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Sortable and paginated payment history table showing all customer transactions.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PaymentHistoryTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBookings = [
  {
    id: "1",
    status: "completed",
    scheduled_start: "2025-01-15T10:00:00Z",
    amount_authorized: 150_000,
    amount_captured: 150_000,
    currency: "COP",
    service_name: "House Cleaning",
    created_at: "2025-01-10T09:00:00Z",
    stripe_payment_intent_id: "pi_1234567890abcdefghij",
    professional: { full_name: "Maria Garcia" },
  },
  {
    id: "2",
    status: "confirmed",
    scheduled_start: "2025-01-20T14:00:00Z",
    amount_authorized: 200_000,
    amount_captured: null,
    currency: "COP",
    service_name: "Deep Cleaning",
    created_at: "2025-01-18T11:30:00Z",
    stripe_payment_intent_id: "pi_0987654321jihgfedcba",
    professional: { full_name: "Ana Rodriguez" },
  },
  {
    id: "3",
    status: "pending",
    scheduled_start: "2025-01-25T09:00:00Z",
    amount_authorized: 120_000,
    amount_captured: null,
    currency: "COP",
    service_name: "Regular Cleaning",
    created_at: "2025-01-22T16:45:00Z",
    stripe_payment_intent_id: "pi_abcdef1234567890ghij",
    professional: { full_name: "Carmen Lopez" },
  },
  {
    id: "4",
    status: "cancelled",
    scheduled_start: null,
    amount_authorized: 180_000,
    amount_captured: null,
    currency: "COP",
    service_name: "Office Cleaning",
    created_at: "2025-01-08T13:20:00Z",
    stripe_payment_intent_id: null,
    professional: { full_name: "Sofia Martinez" },
  },
];

export const WithBookings: Story = {
  args: {
    bookings: sampleBookings,
  },
};

export const Empty: Story = {
  args: {
    bookings: [],
  },
};

export const SingleBooking: Story = {
  args: {
    bookings: [sampleBookings[0]],
  },
};
