// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ContactHero } from "./ContactHero";

const meta = {
  title: "Contact/ContactHero",
  component: ContactHero,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContactHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
