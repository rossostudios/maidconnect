import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { useState } from "react";
import { InstantPayoutModal } from "./instant-payout-modal";

const meta = {
  title: "Finances/InstantPayoutModal",
  component: InstantPayoutModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InstantPayoutModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Wrapper Component for State Management
// ========================================

function InstantPayoutModalWrapper(props: any) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open Modal
      </button>
      <InstantPayoutModal {...props} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// ========================================
// Mock API Responses
// ========================================

const successResponse = {
  success: true,
  message: "Instant payout initiated successfully",
  payout: {
    transferId: "transfer-123",
    stripePayoutId: "po_123456789",
    grossAmountCop: 2500000,
    feeAmountCop: 37500,
    netAmountCop: 2462500,
    status: "processing",
    arrivalDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    requestedAt: new Date().toISOString(),
  },
  newBalance: {
    availableCop: 0,
  },
};

const errorResponse = {
  error: "Rate limit exceeded. Maximum 3 instant payouts per day.",
  errors: ["Rate limit exceeded. Maximum 3 instant payouts per day."],
  warnings: [],
};

// ========================================
// Stories
// ========================================

/**
 * Default state with available balance
 */
export const Default: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onSuccess={(result: any) => {
        console.log("Payout successful:", result);
      }}
      onError={(error: string) => {
        console.error("Payout failed:", error);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500); // Simulate network delay
          return HttpResponse.json(successResponse);
        }),
      ],
    },
  },
};

/**
 * Low balance (below minimum)
 */
export const LowBalance: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={25000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onSuccess={(result: any) => {
        console.log("Payout successful:", result);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500);
          return HttpResponse.json(
            {
              error: "Amount below minimum threshold",
              errors: ["Minimum payout is 50,000 COP (~$12 USD)"],
            },
            { status: 400 }
          );
        }),
      ],
    },
  },
};

/**
 * High balance
 */
export const HighBalance: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={15000000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onSuccess={(result: any) => {
        console.log("Payout successful:", result);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500);
          return HttpResponse.json({
            ...successResponse,
            payout: {
              ...successResponse.payout,
              grossAmountCop: 15000000,
              feeAmountCop: 225000,
              netAmountCop: 14775000,
            },
          });
        }),
      ],
    },
  },
};

/**
 * Rate limit error
 */
export const RateLimitError: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onError={(error: string) => {
        console.error("Payout failed:", error);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500);
          return HttpResponse.json(errorResponse, { status: 429 });
        }),
      ],
    },
  },
};

/**
 * Insufficient balance error
 */
export const InsufficientBalance: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onError={(error: string) => {
        console.error("Payout failed:", error);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500);
          return HttpResponse.json(
            {
              error: "Insufficient available balance",
              errors: ["You don't have enough available balance for this payout"],
            },
            { status: 400 }
          );
        }),
      ],
    },
  },
};

/**
 * Stripe error
 */
export const StripeError: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onError={(error: string) => {
        console.error("Payout failed:", error);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(1500);
          return HttpResponse.json(
            {
              error: "Failed to process instant payout with Stripe",
              details: "Stripe account not configured for instant payouts",
            },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

/**
 * Slow network (long processing)
 */
export const SlowNetwork: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onSuccess={(result: any) => {
        console.log("Payout successful:", result);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(5000); // 5 second delay
          return HttpResponse.json(successResponse);
        }),
      ],
    },
  },
};

/**
 * Quick success (fast network)
 */
export const QuickSuccess: Story = {
  render: () => (
    <InstantPayoutModalWrapper
      availableBalanceCop={2500000}
      feePercentage={1.5}
      minThresholdCop={50000}
      onSuccess={(result: any) => {
        console.log("Payout successful:", result);
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        http.post("/api/pro/payouts/instant", async () => {
          await delay(300); // Very fast response
          return HttpResponse.json(successResponse);
        }),
      ],
    },
  },
};
