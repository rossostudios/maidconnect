// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerSidebar } from "./customer-sidebar";

const meta = {
  title: "Customer/CustomerSidebar",
  component: CustomerSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
