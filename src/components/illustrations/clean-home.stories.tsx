// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CleanHome } from "./clean-home";

const meta = {
  title: "Illustrations/CleanHome",
  component: CleanHome,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CleanHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
