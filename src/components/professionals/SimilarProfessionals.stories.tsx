// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SimilarProfessionals } from "./SimilarProfessionals";

const meta = {
  title: "Professionals/SimilarProfessionals",
  component: SimilarProfessionals,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SimilarProfessionals>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
