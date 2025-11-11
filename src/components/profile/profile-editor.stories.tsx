// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProfileEditor } from "./profile-editor";

const meta = {
  title: "Profile/ProfileEditor",
  component: ProfileEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
