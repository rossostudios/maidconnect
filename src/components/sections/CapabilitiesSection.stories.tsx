// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CapabilitiesSection } from "./CapabilitiesSection";

const meta = {
  title: "Sections/CapabilitiesSection",
  component: CapabilitiesSection,
  parameters: {
    layout: "fullwidth",
    backgrounds: {
      default: "light-stone-200",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CapabilitiesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const OnWhiteBackground: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: "white",
    },
  },
};

export const OnDarkBackground: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};
