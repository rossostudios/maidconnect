// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleListClient } from "./article-list-client";

const meta = {
  title: "Admin/Article List Client",
  component: ArticleListClient,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArticleListClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
