import type { Meta, StoryObj } from "@storybook/react";
import { HttpResponse, http } from "msw";
import { WalletEarningsSummary } from "./wallet-earnings-summary";

const meta = {
  title: "Professionals/WalletEarningsSummary",
  component: WalletEarningsSummary,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Optional className for custom styling",
    },
  },
} satisfies Meta<typeof WalletEarningsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Success Stories
// ========================================

/**
 * Bronze tier professional with 5 completed bookings
 */
export const BronzeTier: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 2_500_000,
            totalBookingsCompleted: 5,
            shareEarningsBadge: true,
            slug: "maria-garcia",
          })
        ),
      ],
    },
  },
};

/**
 * Silver tier professional with 25 completed bookings
 */
export const SilverTier: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 15_000_000,
            totalBookingsCompleted: 25,
            shareEarningsBadge: true,
            slug: "carlos-rodriguez",
          })
        ),
      ],
    },
  },
};

/**
 * Gold tier professional with 75 completed bookings
 */
export const GoldTier: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 45_000_000,
            totalBookingsCompleted: 75,
            shareEarningsBadge: true,
            slug: "ana-martinez",
          })
        ),
      ],
    },
  },
};

/**
 * Platinum tier professional with 150 completed bookings
 */
export const PlatinumTier: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 90_000_000,
            totalBookingsCompleted: 150,
            shareEarningsBadge: true,
            slug: "laura-fernandez",
          })
        ),
      ],
    },
  },
};

/**
 * Professional with badge hidden from public profile
 */
export const BadgeHidden: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 8_000_000,
            totalBookingsCompleted: 15,
            shareEarningsBadge: false,
            slug: "diego-lopez",
          })
        ),
      ],
    },
  },
};

/**
 * New professional with no earnings yet
 */
export const NoEarnings: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 0,
            totalBookingsCompleted: 0,
            shareEarningsBadge: false,
            slug: null,
          })
        ),
      ],
    },
  },
};

/**
 * Professional without public slug
 */
export const NoPublicProfile: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({
            success: true,
            totalEarningsCOP: 12_000_000,
            totalBookingsCompleted: 20,
            shareEarningsBadge: true,
            slug: null,
          })
        ),
      ],
    },
  },
};

// ========================================
// Loading & Error Stories
// ========================================

/**
 * Loading state while fetching data
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", async () => {
          // Never resolves - shows loading state indefinitely
          await new Promise(() => {
            // Intentionally empty - keeps promise pending
          });
        }),
      ],
    },
  },
};

/**
 * Error state when API fails
 */
export const ApiError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({ error: "Failed to fetch wallet summary" }, { status: 500 })
        ),
      ],
    },
  },
};

/**
 * Unauthorized access
 */
export const Unauthorized: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/wallet/summary", () =>
          HttpResponse.json({ error: "Not authorized" }, { status: 403 })
        ),
      ],
    },
  },
};
