import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { BalanceCard } from "./balance-card";

const meta = {
  title: "Finances/BalanceCard",
  component: BalanceCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Mock API Responses
// ========================================

const eligibleBalanceResponse = {
  success: true,
  balance: {
    availableCop: 2500000, // $625 USD equivalent
    pendingCop: 800000, // $200 USD equivalent
    totalCop: 3300000,
  },
  eligibility: {
    isEligible: true,
    reasons: [],
  },
  feeInfo: {
    feePercentage: 1.5,
    minThresholdCop: 50000,
    dailyLimit: 3,
    usedToday: 0,
    remainingToday: 3,
  },
  estimate: {
    grossAmountCop: 2500000,
    feeAmountCop: 37500, // 1.5% of 2.5M
    netAmountCop: 2462500,
  },
  pendingClearances: [
    {
      bookingId: "booking-1",
      amountCop: 300000,
      completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
      clearanceAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      hoursRemaining: 4,
    },
    {
      bookingId: "booking-2",
      amountCop: 500000,
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      clearanceAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      hoursRemaining: 12,
    },
  ],
};

const lowBalanceResponse = {
  ...eligibleBalanceResponse,
  balance: {
    availableCop: 25000, // Below minimum
    pendingCop: 100000,
    totalCop: 125000,
  },
  eligibility: {
    isEligible: false,
    reasons: ["Minimum balance is 50,000 COP"],
  },
  estimate: {
    grossAmountCop: 25000,
    feeAmountCop: 375,
    netAmountCop: 24625,
  },
};

const rateLimitedResponse = {
  ...eligibleBalanceResponse,
  eligibility: {
    isEligible: false,
    reasons: ["Daily limit reached (3 payouts per day)"],
  },
  feeInfo: {
    ...eligibleBalanceResponse.feeInfo,
    usedToday: 3,
    remainingToday: 0,
  },
};

const noStripeAccountResponse = {
  ...eligibleBalanceResponse,
  eligibility: {
    isEligible: false,
    reasons: ["Stripe Connect account not set up"],
  },
};

const noPendingClearancesResponse = {
  ...eligibleBalanceResponse,
  pendingClearances: [],
};

// ========================================
// Stories
// ========================================

/**
 * Default state with eligible balance and pending clearances
 */
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json(eligibleBalanceResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * Balance below minimum threshold
 */
export const BelowMinimum: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json(lowBalanceResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * Rate limit reached (3 payouts already used today)
 */
export const RateLimited: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json(rateLimitedResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * Stripe Connect account not configured
 */
export const NoStripeAccount: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json(noStripeAccountResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * No pending clearances
 */
export const NoPendingClearances: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json(noPendingClearancesResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Never resolves
          return HttpResponse.json(eligibleBalanceResponse);
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * Error state
 */
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};

/**
 * High balance with many pending clearances
 */
export const HighBalance: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/payouts/instant", () => {
          return HttpResponse.json({
            ...eligibleBalanceResponse,
            balance: {
              availableCop: 15000000, // $3,750 USD
              pendingCop: 3000000, // $750 USD
              totalCop: 18000000,
            },
            estimate: {
              grossAmountCop: 15000000,
              feeAmountCop: 225000, // 1.5%
              netAmountCop: 14775000,
            },
            pendingClearances: [
              {
                bookingId: "booking-1",
                amountCop: 500000,
                completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                clearanceAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
                hoursRemaining: 1,
              },
              {
                bookingId: "booking-2",
                amountCop: 800000,
                completedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
                clearanceAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                hoursRemaining: 6,
              },
              {
                bookingId: "booking-3",
                amountCop: 600000,
                completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                clearanceAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                hoursRemaining: 12,
              },
              {
                bookingId: "booking-4",
                amountCop: 1100000,
                completedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                clearanceAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
                hoursRemaining: 16,
              },
            ],
          });
        }),
      ],
    },
  },
  args: {
    onRequestPayout: () => alert("Open instant payout modal"),
  },
};
