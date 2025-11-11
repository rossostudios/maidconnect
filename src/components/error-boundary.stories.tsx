// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ErrorBoundary } from "./error-boundary";

const meta = {
  title: "Error-boundary.tsx/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
