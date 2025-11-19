import type { Meta, StoryObj } from "@storybook/react";
import { EarningsBadge, EarningsBadgeCompact, EarningsBadgeTooltip } from "./earnings-badge";

const meta = {
  title: "Professionals/EarningsBadge",
  component: EarningsBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EarningsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// EarningsBadge Stories
// ========================================

export const BronzeBadge: Story = {
  args: {
    totalBookings: 5,
    size: "md",
  },
};

export const SilverBadge: Story = {
  args: {
    totalBookings: 25,
    size: "md",
  },
};

export const GoldBadge: Story = {
  args: {
    totalBookings: 75,
    size: "md",
  },
};

export const PlatinumBadge: Story = {
  args: {
    totalBookings: 150,
    size: "md",
  },
};

export const WithEarnings: Story = {
  args: {
    totalBookings: 45,
    totalEarningsCOP: 25_000_000, // $25K COP
    showEarnings: true,
    size: "md",
  },
};

export const WithProgress: Story = {
  args: {
    totalBookings: 35,
    showProgress: true,
    size: "md",
  },
};

export const WithEarningsAndProgress: Story = {
  args: {
    totalBookings: 45,
    totalEarningsCOP: 35_500_000, // $35.5K COP
    showEarnings: true,
    showProgress: true,
    size: "md",
  },
};

export const SmallSize: Story = {
  args: {
    totalBookings: 25,
    totalEarningsCOP: 15_000_000,
    showEarnings: true,
    size: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    totalBookings: 75,
    totalEarningsCOP: 50_000_000,
    showEarnings: true,
    size: "lg",
  },
};

export const HighEarnings: Story = {
  args: {
    totalBookings: 150,
    totalEarningsCOP: 125_000_000, // $125K COP
    showEarnings: true,
    showProgress: false,
    size: "md",
  },
};

// ========================================
// Compact Badge Stories
// ========================================

export const CompactBronze: StoryObj<typeof EarningsBadgeCompact> = {
  render: () => <EarningsBadgeCompact tier="bronze" />,
};

export const CompactSilver: StoryObj<typeof EarningsBadgeCompact> = {
  render: () => <EarningsBadgeCompact tier="silver" />,
};

export const CompactGold: StoryObj<typeof EarningsBadgeCompact> = {
  render: () => <EarningsBadgeCompact tier="gold" />,
};

export const CompactPlatinum: StoryObj<typeof EarningsBadgeCompact> = {
  render: () => <EarningsBadgeCompact tier="platinum" />,
};

// ========================================
// Tooltip Stories
// ========================================

export const TooltipBronze: StoryObj<typeof EarningsBadgeTooltip> = {
  render: () => (
    <div className="flex h-64 items-center justify-center">
      <EarningsBadgeTooltip totalBookings={5}>
        <EarningsBadgeCompact tier="bronze" />
      </EarningsBadgeTooltip>
      <p className="mt-4 text-neutral-600 text-sm">Hover over the badge to see tooltip</p>
    </div>
  ),
};

export const TooltipSilver: StoryObj<typeof EarningsBadgeTooltip> = {
  render: () => (
    <div className="flex h-64 items-center justify-center">
      <EarningsBadgeTooltip totalBookings={35}>
        <EarningsBadgeCompact tier="silver" />
      </EarningsBadgeTooltip>
      <p className="mt-4 text-neutral-600 text-sm">Hover over the badge to see tooltip</p>
    </div>
  ),
};

export const TooltipGold: StoryObj<typeof EarningsBadgeTooltip> = {
  render: () => (
    <div className="flex h-64 items-center justify-center">
      <EarningsBadgeTooltip totalBookings={85}>
        <EarningsBadgeCompact tier="gold" />
      </EarningsBadgeTooltip>
      <p className="mt-4 text-neutral-600 text-sm">Hover over the badge to see tooltip</p>
    </div>
  ),
};

export const TooltipPlatinum: StoryObj<typeof EarningsBadgeTooltip> = {
  render: () => (
    <div className="flex h-64 items-center justify-center">
      <EarningsBadgeTooltip totalBookings={150}>
        <EarningsBadgeCompact tier="platinum" />
      </EarningsBadgeTooltip>
      <p className="mt-4 text-neutral-600 text-sm">Hover over the badge to see tooltip</p>
    </div>
  ),
};

// ========================================
// All Tiers Showcase
// ========================================

export const AllTiers: StoryObj<typeof EarningsBadge> = {
  render: () => (
    <div className="space-y-6 p-8">
      <div>
        <h3 className="mb-4 font-semibold text-neutral-900 text-xl">Badge Tiers</h3>
        <div className="space-y-4">
          <EarningsBadge size="md" totalBookings={5} />
          <EarningsBadge size="md" totalBookings={25} />
          <EarningsBadge size="md" totalBookings={75} />
          <EarningsBadge size="md" totalBookings={150} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-neutral-900 text-xl">With Earnings & Progress</h3>
        <div className="space-y-4">
          <EarningsBadge
            showEarnings
            showProgress
            size="md"
            totalBookings={8}
            totalEarningsCOP={5_500_000}
          />
          <EarningsBadge
            showEarnings
            showProgress
            size="md"
            totalBookings={35}
            totalEarningsCOP={22_000_000}
          />
          <EarningsBadge
            showEarnings
            showProgress
            size="md"
            totalBookings={85}
            totalEarningsCOP={68_500_000}
          />
          <EarningsBadge
            showEarnings
            showProgress={false}
            size="md"
            totalBookings={150}
            totalEarningsCOP={125_000_000}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-neutral-900 text-xl">Compact Variants</h3>
        <div className="flex flex-wrap gap-3">
          <EarningsBadgeCompact tier="bronze" />
          <EarningsBadgeCompact tier="silver" />
          <EarningsBadgeCompact tier="gold" />
          <EarningsBadgeCompact tier="platinum" />
        </div>
      </div>
    </div>
  ),
};
