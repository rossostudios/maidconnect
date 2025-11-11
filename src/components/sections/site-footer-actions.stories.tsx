// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SiteFooterActions } from "./site-footer-actions";

const meta = {
  title: "Sections/SiteFooterActions",
  component: SiteFooterActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SiteFooterActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};
