// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CareersValues } from "./CareersValues";

const meta = {
  title: "Careers/CareersValues",
  component: CareersValues,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CareersValues>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
