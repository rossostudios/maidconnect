// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerHeader } from "./customer-header";

const meta = {
  title: "Customer/CustomerHeader",
  component: CustomerHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
