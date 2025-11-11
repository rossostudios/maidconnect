// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProSidebar } from "./ProSidebar";

const meta = {
  title: "Professional/ProSidebar",
  component: ProSidebar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
