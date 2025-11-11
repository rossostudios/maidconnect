// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalsDirectory } from "./professionals-directory";

const meta = {
  title: "Professionals/ProfessionalsDirectory",
  component: ProfessionalsDirectory,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfessionalsDirectory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
