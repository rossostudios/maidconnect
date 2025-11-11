// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProHeader } from "./pro-header";

const meta = {
  title: "Professional/ProHeader",
  component: ProHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
