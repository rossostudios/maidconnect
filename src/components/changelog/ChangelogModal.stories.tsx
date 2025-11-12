// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ChangelogModal } from "./ChangelogModal";

const meta = {
  title: "Changelog/ChangelogModal",
  component: ChangelogModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChangelogModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
