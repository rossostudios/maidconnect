// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { TableOfContents } from "./table-of-contents";

const meta = {
  title: "Communication/Help/TableOfContents",
  component: TableOfContents,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        <div className="prose mb-8">
          <h2 id="introduction">Introduction</h2>
          <p>Lorem ipsum dolor sit amet...</p>
          <h2 id="getting-started">Getting Started</h2>
          <p>Lorem ipsum dolor sit amet...</p>
          <h3 id="installation">Installation</h3>
          <p>Lorem ipsum dolor sit amet...</p>
          <h3 id="configuration">Configuration</h3>
          <p>Lorem ipsum dolor sit amet...</p>
          <h2 id="usage">Usage</h2>
          <p>Lorem ipsum dolor sit amet...</p>
        </div>
        <Story />
      </div>
    ),
  ],
};
