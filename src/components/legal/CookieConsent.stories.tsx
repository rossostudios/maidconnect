// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CookieConsent } from "./CookieConsent";

const meta = {
  title: "Legal/CookieConsent",
  component: CookieConsent,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
