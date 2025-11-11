// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ChangelogEditor } from "./changelog-editor";

const meta = {
  title: "Admin/Changelog Editor",
  component: ChangelogEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChangelogEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
