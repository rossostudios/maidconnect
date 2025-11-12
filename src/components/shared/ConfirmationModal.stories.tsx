// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmationModal } from "./ConfirmationModal";

const meta = {
  title: "Shared/ConfirmationModal",
  component: ConfirmationModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
