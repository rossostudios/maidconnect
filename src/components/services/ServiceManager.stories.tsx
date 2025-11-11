// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceManager } from "./ServiceManager";

const meta = {
  title: "Services/ServiceManager",
  component: ServiceManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
