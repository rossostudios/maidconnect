// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceExecutionCard } from "./Execution";

const meta = {
  title: "Bookings/ServiceExecutionCard",
  component: ServiceExecutionCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceExecutionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
