// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleViewer } from "./article-viewer";

const meta = {
  title: "Help/ArticleViewer",
  component: ArticleViewer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArticleViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
