// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ServiceCard } from "./service-card";

const meta = {
  title: "Services/ServiceCard",
  component: ServiceCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
