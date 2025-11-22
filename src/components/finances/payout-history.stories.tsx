import type { Meta, StoryObj } from "@storybook/react";
import { addDays, subDays, subHours } from "date-fns";
import { PayoutHistory } from "./payout-history";

const meta = {
  title: "Finances/PayoutHistory",
  component: PayoutHistory,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PayoutHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Mock Data
// ========================================

const instantTransfers = [
  {
    id: "transfer-1",
    professional_id: "prof-123",
    amount_cop: 2_500_000,
    payout_type: "instant" as const,
    fee_amount_cop: 37_500,
    fee_percentage: 1.5,
    requested_at: subHours(new Date(), 2).toISOString(),
    processed_at: subHours(new Date(), 2).toISOString(),
    status: "completed" as const,
    stripe_payout_id: "po_123456789",
    error_message: null,
    created_at: subHours(new Date(), 2).toISOString(),
  },
  {
    id: "transfer-2",
    professional_id: "prof-123",
    amount_cop: 1_500_000,
    payout_type: "instant" as const,
    fee_amount_cop: 22_500,
    fee_percentage: 1.5,
    requested_at: subDays(new Date(), 1).toISOString(),
    processed_at: subDays(new Date(), 1).toISOString(),
    status: "completed" as const,
    stripe_payout_id: "po_987654321",
    error_message: null,
    created_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: "transfer-3",
    professional_id: "prof-123",
    amount_cop: 800_000,
    payout_type: "instant" as const,
    fee_amount_cop: 12_000,
    fee_percentage: 1.5,
    requested_at: subDays(new Date(), 3).toISOString(),
    processed_at: null,
    status: "pending" as const,
    stripe_payout_id: "po_pending123",
    error_message: null,
    created_at: subDays(new Date(), 3).toISOString(),
  },
];

const batchTransfers = [
  {
    id: "transfer-4",
    professional_id: "prof-123",
    amount_cop: 5_000_000,
    payout_type: "batch" as const,
    fee_amount_cop: null,
    fee_percentage: null,
    requested_at: subDays(new Date(), 5).toISOString(),
    processed_at: subDays(new Date(), 3).toISOString(),
    status: "completed" as const,
    stripe_payout_id: "po_batch123",
    error_message: null,
    created_at: subDays(new Date(), 5).toISOString(),
  },
  {
    id: "transfer-5",
    professional_id: "prof-123",
    amount_cop: 3_200_000,
    payout_type: "batch" as const,
    fee_amount_cop: null,
    fee_percentage: null,
    requested_at: subDays(new Date(), 12).toISOString(),
    processed_at: subDays(new Date(), 10).toISOString(),
    status: "completed" as const,
    stripe_payout_id: "po_batch456",
    error_message: null,
    created_at: subDays(new Date(), 12).toISOString(),
  },
];

const mixedTransfers = [...instantTransfers, ...batchTransfers];

const processingTransfer = {
  id: "transfer-processing",
  professional_id: "prof-123",
  amount_cop: 1_200_000,
  payout_type: "instant" as const,
  fee_amount_cop: 18_000,
  fee_percentage: 1.5,
  requested_at: subHours(new Date(), 1).toISOString(),
  processed_at: null,
  status: "processing" as const,
  stripe_payout_id: null,
  error_message: null,
  created_at: subHours(new Date(), 1).toISOString(),
};

const failedTransfer = {
  id: "transfer-failed",
  professional_id: "prof-123",
  amount_cop: 950_000,
  payout_type: "instant" as const,
  fee_amount_cop: 14_250,
  fee_percentage: 1.5,
  requested_at: subDays(new Date(), 2).toISOString(),
  processed_at: null,
  status: "failed" as const,
  stripe_payout_id: null,
  error_message: "Insufficient funds in Stripe account",
  created_at: subDays(new Date(), 2).toISOString(),
};

const largeHistoryTransfers = Array.from({ length: 25 }, (_, i) => ({
  id: `transfer-${i}`,
  professional_id: "prof-123",
  amount_cop: Math.floor(Math.random() * 4_000_000) + 500_000,
  payout_type: (i % 3 === 0 ? "instant" : "batch") as "instant" | "batch",
  fee_amount_cop: i % 3 === 0 ? Math.floor(Math.random() * 60_000) + 7500 : null,
  fee_percentage: i % 3 === 0 ? 1.5 : null,
  requested_at: subDays(new Date(), i + 1).toISOString(),
  processed_at: i % 5 === 0 ? null : subDays(new Date(), i).toISOString(),
  status: (i % 5 === 0 ? "pending" : "completed") as "completed" | "pending",
  stripe_payout_id: i % 5 === 0 ? null : `po_${i}`,
  error_message: null,
  created_at: subDays(new Date(), i + 1).toISOString(),
}));

// ========================================
// Stories
// ========================================

/**
 * Default state with mixed instant and batch payouts
 */
export const Default: Story = {
  args: {
    transfers: mixedTransfers,
    isLoading: false,
  },
};

/**
 * Only instant payouts
 */
export const InstantOnly: Story = {
  args: {
    transfers: instantTransfers,
    isLoading: false,
  },
};

/**
 * Only batch payouts (no fees)
 */
export const BatchOnly: Story = {
  args: {
    transfers: batchTransfers,
    isLoading: false,
  },
};

/**
 * With processing transaction
 */
export const WithProcessing: Story = {
  args: {
    transfers: [processingTransfer, ...mixedTransfers],
    isLoading: false,
  },
};

/**
 * With failed transaction
 */
export const WithFailed: Story = {
  args: {
    transfers: [failedTransfer, ...mixedTransfers],
    isLoading: false,
  },
};

/**
 * All status types
 */
export const AllStatuses: Story = {
  args: {
    transfers: [processingTransfer, failedTransfer, ...mixedTransfers],
    isLoading: false,
  },
};

/**
 * Large history with many transactions
 */
export const LargeHistory: Story = {
  args: {
    transfers: largeHistoryTransfers,
    isLoading: false,
  },
};

/**
 * Empty state (no transactions)
 */
export const Empty: Story = {
  args: {
    transfers: [],
    isLoading: false,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    transfers: [],
    isLoading: true,
  },
};

/**
 * Recent activity (last 7 days)
 */
export const RecentActivity: Story = {
  args: {
    transfers: Array.from({ length: 8 }, (_, i) => ({
      id: `recent-${i}`,
      professional_id: "prof-123",
      amount_cop: Math.floor(Math.random() * 3_000_000) + 500_000,
      payout_type: (i % 2 === 0 ? "instant" : "batch") as "instant" | "batch",
      fee_amount_cop: i % 2 === 0 ? Math.floor(Math.random() * 45_000) + 7500 : null,
      fee_percentage: i % 2 === 0 ? 1.5 : null,
      requested_at: subDays(new Date(), i).toISOString(),
      processed_at: subDays(new Date(), i).toISOString(),
      status: "completed" as const,
      stripe_payout_id: `po_recent_${i}`,
      error_message: null,
      created_at: subDays(new Date(), i).toISOString(),
    })),
    isLoading: false,
  },
};

/**
 * High value transactions
 */
export const HighValue: Story = {
  args: {
    transfers: [
      {
        id: "high-1",
        professional_id: "prof-123",
        amount_cop: 15_000_000,
        payout_type: "instant" as const,
        fee_amount_cop: 225_000,
        fee_percentage: 1.5,
        requested_at: subDays(new Date(), 1).toISOString(),
        processed_at: subDays(new Date(), 1).toISOString(),
        status: "completed" as const,
        stripe_payout_id: "po_high_1",
        error_message: null,
        created_at: subDays(new Date(), 1).toISOString(),
      },
      {
        id: "high-2",
        professional_id: "prof-123",
        amount_cop: 25_000_000,
        payout_type: "batch" as const,
        fee_amount_cop: null,
        fee_percentage: null,
        requested_at: subDays(new Date(), 7).toISOString(),
        processed_at: subDays(new Date(), 5).toISOString(),
        status: "completed" as const,
        stripe_payout_id: "po_high_2",
        error_message: null,
        created_at: subDays(new Date(), 7).toISOString(),
      },
      {
        id: "high-3",
        professional_id: "prof-123",
        amount_cop: 8_500_000,
        payout_type: "instant" as const,
        fee_amount_cop: 127_500,
        fee_percentage: 1.5,
        requested_at: subDays(new Date(), 14).toISOString(),
        processed_at: subDays(new Date(), 14).toISOString(),
        status: "completed" as const,
        stripe_payout_id: "po_high_3",
        error_message: null,
        created_at: subDays(new Date(), 14).toISOString(),
      },
    ],
    isLoading: false,
  },
};
