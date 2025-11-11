// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CareersPositions } from "./careers-positions";

const meta = {
  title: "Careers/CareersPositions",
  component: CareersPositions,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CareersPositions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
