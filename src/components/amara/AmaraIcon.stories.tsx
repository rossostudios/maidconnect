// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraIcon } from "./AmaraIcon";

const meta = {
  title: "Amara/AmaraIcon",
  component: AmaraIcon,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
