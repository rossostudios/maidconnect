// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FormModal } from "./FormModal";

const meta = {
  title: "Shared/FormModal",
  component: FormModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
