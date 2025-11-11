// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CompactTrustBadge } from "./compact-trust-badge";

const meta = {
  title: "Professionals/CompactTrustBadge",
  component: CompactTrustBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    verificationLevel: {
      control: "select",
      options: ["none", "basic", "enhanced", "background-check"],
    },
    rating: {
      control: { type: "number", min: 0, max: 5, step: 0.1 },
    },
    reviewCount: {
      control: { type: "number", min: 0 },
    },
  },
} satisfies Meta<typeof CompactTrustBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BackgroundChecked: Story = {
  args: {
    verificationLevel: "background-check",
    languages: ["English", "Spanish"],
    rating: 4.9,
    reviewCount: 126,
    services: ["House Cleaning", "Deep Cleaning", "Move-in/out"],
  },
};

export const EnhancedVerified: Story = {
  args: {
    verificationLevel: "enhanced",
    languages: ["Spanish"],
    rating: 4.7,
    reviewCount: 45,
    services: ["House Cleaning"],
  },
};

export const BasicVerified: Story = {
  args: {
    verificationLevel: "basic",
    languages: ["English"],
    rating: 4.5,
    reviewCount: 12,
    services: ["House Cleaning", "Laundry"],
  },
};

export const NewProfessional: Story = {
  args: {
    verificationLevel: "basic",
    languages: ["Spanish", "English"],
    rating: 0,
    reviewCount: 0,
    services: [],
  },
};

export const HighlyRated: Story = {
  args: {
    verificationLevel: "background-check",
    languages: ["Spanish", "English", "Portuguese"],
    rating: 5.0,
    reviewCount: 247,
    services: ["House Cleaning", "Deep Cleaning", "Post-construction", "Move-in/out", "Laundry"],
  },
};

export const MinimalInfo: Story = {
  args: {
    verificationLevel: "none",
    languages: [],
    rating: 4.2,
    reviewCount: 3,
    services: [],
  },
};
