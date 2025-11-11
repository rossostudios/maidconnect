// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DisputesTable } from "./disputes-table";

const meta = {
  title: "Admin/Disputes Table",
  component: DisputesTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DisputesTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
