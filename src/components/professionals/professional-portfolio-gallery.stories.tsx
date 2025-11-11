// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalPortfolioGallery } from "./professional-portfolio-gallery";

const meta = {
  title: "Professionals/ProfessionalPortfolioGallery",
  component: ProfessionalPortfolioGallery,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalPortfolioGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
