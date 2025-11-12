// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CompanyStory } from "./CompanyStory";

const meta = {
  title: "About/CompanyStory",
  component: CompanyStory,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CompanyStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
