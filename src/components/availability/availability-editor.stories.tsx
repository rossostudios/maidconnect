// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AvailabilityEditor } from "./availability-editor";

const meta = {
  title: "Availability/AvailabilityEditor",
  component: AvailabilityEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvailabilityEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
