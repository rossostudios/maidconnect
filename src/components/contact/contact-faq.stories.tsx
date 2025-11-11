// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ContactFaq } from "./contact-faq";

const meta = {
  title: "Contact/ContactFaq",
  component: ContactFaq,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContactFaq>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
