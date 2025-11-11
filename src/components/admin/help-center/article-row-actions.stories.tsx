// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleRowActions } from "./article-row-actions";

const meta = {
  title: "Admin/Article Row Actions",
  component: ArticleRowActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArticleRowActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
