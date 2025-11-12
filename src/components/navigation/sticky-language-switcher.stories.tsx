// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { StickyLanguageSwitcher } from "./sticky-language-switcher";

const meta = {
  title: "Navigation/StickyLanguageSwitcher",
  component: StickyLanguageSwitcher,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StickyLanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-neutral-50">
        <div className="p-8">
          <h1 className="font-bold text-3xl text-neutral-900">Marketing Page</h1>
          <p className="mt-4 text-neutral-600">
            The language switcher is fixed at the top-right corner. It stays visible as you scroll.
          </p>
          <div className="mt-8 space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <p className="text-neutral-600" key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-neutral-900">
        <div className="p-8">
          <h1 className="font-bold text-3xl text-white">Dark Marketing Page</h1>
          <p className="mt-4 text-neutral-300">
            The language switcher stands out against dark backgrounds.
          </p>
          <div className="mt-8 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <p className="text-neutral-300" key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-neutral-50">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-neutral-900">Mobile View</h1>
          <p className="mt-4 text-neutral-600">On mobile, shows compact language code (EN/ES).</p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const Tablet: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-neutral-50">
        <div className="p-6">
          <h1 className="font-bold text-2xl text-neutral-900">Tablet View</h1>
          <p className="mt-4 text-neutral-600">
            On tablet and larger screens, shows full language name with flag.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
