// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ContactCards } from "./contact-cards";

const meta = {
  title: "Contact/ContactCards",
  component: ContactCards,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContactCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
