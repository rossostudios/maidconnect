// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DocumentsTable } from "./DocumentsTable";

const meta = {
  title: "Documents/DocumentsTable",
  component: DocumentsTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocumentsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
