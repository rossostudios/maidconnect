// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TimeExtensionModal } from "./TimeExtension";

const meta = {
  title: "Bookings/TimeExtensionModal",
  component: TimeExtensionModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TimeExtensionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
