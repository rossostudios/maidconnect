// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackLink } from "./FeedbackLink";

const meta = {
  title: "Communication/Feedback/FeedbackLink",
  component: FeedbackLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Send us feedback",
  },
};

export const CustomText: Story = {
  args: {
    children: "Report an issue",
  },
};
