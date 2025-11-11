// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BlockEditor } from "./block-editor";

const meta = {
  title: "Admin/Block Editor",
  component: BlockEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
