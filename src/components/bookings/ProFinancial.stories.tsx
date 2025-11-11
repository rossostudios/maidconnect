// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProFinancialSummary } from "./ProFinancial";

const meta = {
  title: "Bookings/ProFinancialSummary",
  component: ProFinancialSummary,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProFinancialSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
