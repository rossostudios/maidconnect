// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleForm } from "./ArticleForm";

const meta = {
  title: "Admin/HelpCenter/ArticleForm",
  component: ArticleForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArticleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
