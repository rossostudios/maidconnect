// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MapView } from "./MapView";

const meta = {
  title: "Professionals/MapView",
  component: MapView,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MapView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
