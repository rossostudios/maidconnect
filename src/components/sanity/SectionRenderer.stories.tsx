// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SectionRenderer } from "./SectionRenderer";

const meta = {
  title: "Sanity/SectionRenderer",
  component: SectionRenderer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SectionRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
