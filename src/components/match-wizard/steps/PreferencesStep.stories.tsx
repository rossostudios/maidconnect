// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesStep } from "./PreferencesStep";

const meta = {
  title: "Match-wizard/PreferencesStep",
  component: PreferencesStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PreferencesStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
