// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FinancesOverview } from "./finances-overview";

const meta = {
  title: "Finances/FinancesOverview",
  component: FinancesOverview,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Comprehensive financial dashboard showing earnings trends, bookings analytics, and revenue breakdown for professionals.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FinancesOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBookings = [
  {
    id: "1",
    status: "completed",
    scheduled_start: "2025-01-15T10:00:00Z",
    amount_captured: 150_000,
    amount_authorized: 150_000,
    currency: "COP",
    service_name: "House Cleaning",
    created_at: "2025-01-10T09:00:00Z",
  },
  {
    id: "2",
    status: "completed",
    scheduled_start: "2024-12-20T14:00:00Z",
    amount_captured: 200_000,
    amount_authorized: 200_000,
    currency: "COP",
    service_name: "Deep Cleaning",
    created_at: "2024-12-18T11:30:00Z",
  },
  {
    id: "3",
    status: "completed",
    scheduled_start: "2024-11-25T09:00:00Z",
    amount_captured: 120_000,
    amount_authorized: 120_000,
    currency: "COP",
    service_name: "Regular Cleaning",
    created_at: "2024-11-22T16:45:00Z",
  },
];

const samplePayouts = [
  {
    id: "1",
    amount: 150_000,
    status: "pending",
    created_at: "2025-01-15T10:00:00Z",
    processed_at: null,
  },
  {
    id: "2",
    amount: 200_000,
    status: "completed",
    created_at: "2024-12-20T10:00:00Z",
    processed_at: "2024-12-22T10:00:00Z",
  },
];

export const Default: Story = {
  args: {
    bookings: sampleBookings,
    payouts: samplePayouts,
  },
};

export const Empty: Story = {
  args: {
    bookings: [],
    payouts: [],
  },
};

export const ManyBookings: Story = {
  args: {
    bookings: [...sampleBookings, ...sampleBookings, ...sampleBookings],
    payouts: samplePayouts,
  },
};
