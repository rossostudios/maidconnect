// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CareersHero } from "./careers-hero";

const meta = {
  title: "Careers/CareersHero",
  component: CareersHero,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CareersHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
