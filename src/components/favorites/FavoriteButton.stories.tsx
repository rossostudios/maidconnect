// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FavoriteButton } from "./FavoriteButton";

const meta = {
  title: "Favorites/FavoriteButton",
  component: FavoriteButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FavoriteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
