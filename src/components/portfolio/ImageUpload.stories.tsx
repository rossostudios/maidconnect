// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ImageUploadDropzone } from "./ImageUpload";

const meta = {
  title: "Portfolio/ImageUploadDropzone",
  component: ImageUploadDropzone,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageUploadDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
