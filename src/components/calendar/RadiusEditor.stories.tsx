// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceRadiusEditor } from "./RadiusEditor";

const meta = {
  title: "Calendar/ServiceRadiusEditor",
  component: ServiceRadiusEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceRadiusEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
