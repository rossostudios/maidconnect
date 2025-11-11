// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { LocalProfessionals } from "./local-professionals";

const meta = {
  title: "City/LocalProfessionals",
  component: LocalProfessionals,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LocalProfessionals>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
