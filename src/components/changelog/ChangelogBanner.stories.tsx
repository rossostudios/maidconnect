// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ChangelogBanner } from "./ChangelogBanner";

const meta = {
  title: "Changelog/ChangelogBanner",
  component: ChangelogBanner,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChangelogBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
