// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FavoritesList } from "./FavoritesList";

const meta = {
  title: "Favorites/FavoritesList",
  component: FavoritesList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FavoritesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
