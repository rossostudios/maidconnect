import type { Meta, StoryObj } from "@storybook/react";
import { PlatformBusinessSettings } from "./platform-business-settings";

const meta = {
  title: "Admin/Platform Business Settings",
  component: PlatformBusinessSettings,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Platform business settings editor with Anthropic-inspired design. Manage commission rates, fees, booking rules, and payout settings with refined typography and warm orange accents.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlatformBusinessSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSettings = {
  commission_rate: 15,
  service_fee: 2.99,
  cancellation_fees: {
    customer: 0,
    professional: 10,
    no_show: 25,
  },
  booking_rules: {
    min_advance_hours: 24,
    max_duration_hours: 8,
    min_booking_amount: 30,
    max_service_radius_km: 50,
    auto_accept_threshold: 100,
  },
  payout_settings: {
    schedule: "weekly" as const,
    min_threshold: 50,
    currency: "USD",
    auto_payout: true,
  },
};

/**
 * Default platform business settings with standard values
 */
export const Default: Story = {
  args: {
    initialSettings: defaultSettings,
  },
};

/**
 * Premium tier with higher commission and stricter rules
 */
export const PremiumTier: Story = {
  args: {
    initialSettings: {
      ...defaultSettings,
      commission_rate: 20,
      service_fee: 4.99,
      booking_rules: {
        ...defaultSettings.booking_rules,
        min_booking_amount: 50,
        min_advance_hours: 48,
      },
      payout_settings: {
        ...defaultSettings.payout_settings,
        min_threshold: 100,
      },
    },
  },
};

/**
 * Budget tier with lower commission and flexible rules
 */
export const BudgetTier: Story = {
  args: {
    initialSettings: {
      ...defaultSettings,
      commission_rate: 10,
      service_fee: 1.99,
      booking_rules: {
        ...defaultSettings.booking_rules,
        min_booking_amount: 20,
        min_advance_hours: 12,
      },
      payout_settings: {
        ...defaultSettings.payout_settings,
        schedule: "daily" as const,
        min_threshold: 25,
      },
    },
  },
};
