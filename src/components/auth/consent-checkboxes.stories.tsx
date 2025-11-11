// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ConsentCheckboxes } from "./consent-checkboxes";

const meta = {
  title: "Auth/ConsentCheckboxes",
  component: ConsentCheckboxes,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConsentCheckboxes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
