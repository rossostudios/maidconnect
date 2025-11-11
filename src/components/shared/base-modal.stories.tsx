// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BaseModal } from "./base-modal";

const meta = {
  title: "Shared/BaseModal",
  component: BaseModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BaseModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
