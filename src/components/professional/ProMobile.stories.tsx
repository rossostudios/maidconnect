// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProMobileSidebar } from "./ProMobile";

const meta = {
  title: "Professional/ProMobileSidebar",
  component: ProMobileSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProMobileSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
