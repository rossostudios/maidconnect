// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceAddonsManager } from "./Addons";

const meta = {
  title: "Service-addons/ServiceAddonsManager",
  component: ServiceAddonsManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceAddonsManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
