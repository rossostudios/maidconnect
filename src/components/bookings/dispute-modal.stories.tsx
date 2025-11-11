// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DisputeModal } from "./dispute-modal";

const meta = {
  title: "Bookings/DisputeModal",
  component: DisputeModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DisputeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
