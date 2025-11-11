// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PortfolioGallery } from "./portfolio-gallery";

const meta = {
  title: "Portfolio/PortfolioGallery",
  component: PortfolioGallery,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PortfolioGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
