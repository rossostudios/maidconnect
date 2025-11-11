// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CtaSection } from "./CtaSection";

const meta = {
  title: "Sanity/CtaSection",
  component: CtaSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CtaSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
