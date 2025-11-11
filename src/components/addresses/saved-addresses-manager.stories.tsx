// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SavedAddressesManager } from "./saved-addresses-manager";

const meta = {
  title: "Addresses/SavedAddressesManager",
  component: SavedAddressesManager,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SavedAddressesManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    addresses: [
      {
        id: "1",
        label: "Home",
        street: "123 Main St",
        city: "Bogotá",
        neighborhood: "Chapinero",
        postal_code: "110111",
        is_default: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        label: "Work",
        street: "456 Office Ave",
        city: "Medellín",
        neighborhood: "El Poblado",
        postal_code: "050001",
        is_default: false,
        created_at: new Date().toISOString(),
      },
    ],
  },
};
