// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./search-bar";

const meta = {
  title: "Help/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
