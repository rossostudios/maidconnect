// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PortfolioManager } from "./PortfolioManager";

const meta = {
  title: "Portfolio/PortfolioManager",
  component: PortfolioManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PortfolioManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
