// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SearchTrigger } from "./SearchTrigger";

const meta = {
  title: "Search/SearchTrigger",
  component: SearchTrigger,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
