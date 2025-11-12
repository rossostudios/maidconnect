// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraMessageActions } from "./AmaraMessage";

const meta = {
  title: "Amara/AmaraMessageActions",
  component: AmaraMessageActions,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraMessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
