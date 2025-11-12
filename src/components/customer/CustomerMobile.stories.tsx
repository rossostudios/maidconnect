// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerMobileSidebar } from "./CustomerMobile";

const meta = {
  title: "Customer/CustomerMobileSidebar",
  component: CustomerMobileSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerMobileSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
