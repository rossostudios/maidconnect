// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RebookModal } from "./rebook-modal";

const meta = {
  title: "Bookings/RebookModal",
  component: RebookModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RebookModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
