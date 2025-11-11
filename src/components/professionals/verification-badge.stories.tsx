// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { OnTimeRateBadge, RatingBadge, VerificationBadge } from "./verification-badge";

const verificationMeta = {
  title: "Professionals/VerificationBadge",
  component: VerificationBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: ["none", "basic", "enhanced", "background-check"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof VerificationBadge>;

export default verificationMeta;
type Story = StoryObj<typeof verificationMeta>;

export const Basic: Story = {
  args: {
    level: "basic",
    size: "sm",
  },
};

export const Enhanced: Story = {
  args: {
    level: "enhanced",
    size: "md",
  },
};

export const BackgroundCheck: Story = {
  args: {
    level: "background-check",
    size: "lg",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <VerificationBadge level="background-check" size="sm" />
        <VerificationBadge level="background-check" size="md" />
        <VerificationBadge level="background-check" size="lg" />
      </div>
    </div>
  ),
};

// On-Time Rate Badge Stories
const onTimeMeta = {
  title: "Professionals/OnTimeRateBadge",
  component: OnTimeRateBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OnTimeRateBadge>;

export const OnTimeExcellent: StoryObj<typeof onTimeMeta> = {
  args: {
    rate: 98,
    size: "md",
  },
};

export const OnTimeGood: StoryObj<typeof onTimeMeta> = {
  args: {
    rate: 85,
    size: "md",
  },
};

// Rating Badge Stories
const ratingMeta = {
  title: "Professionals/RatingBadge",
  component: RatingBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RatingBadge>;

export const RatingHighlyRated: StoryObj<typeof ratingMeta> = {
  args: {
    rating: 4.9,
    reviewCount: 126,
    size: "md",
  },
};

export const RatingNew: StoryObj<typeof ratingMeta> = {
  args: {
    rating: 0,
    reviewCount: 0,
    size: "md",
  },
};

export const RatingFewReviews: StoryObj<typeof ratingMeta> = {
  args: {
    rating: 4.5,
    reviewCount: 3,
    size: "sm",
  },
};
