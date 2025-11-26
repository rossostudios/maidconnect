import {
  Analytics01Icon,
  Home01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { LiaTooltip } from "./lia-tooltip";

const meta = {
  title: "UI/LiaTooltip",
  component: LiaTooltip,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[200px] items-center justify-center bg-neutral-50 p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiaTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "Overview",
    children: (
      <button
        className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Home01Icon} />
      </button>
    ),
  },
};

export const Users: Story = {
  args: {
    content: "Users",
    children: (
      <button
        className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-rausch-50"
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={UserGroupIcon} />
      </button>
    ),
  },
};

export const Settings: Story = {
  args: {
    content: "Settings",
    children: (
      <button
        className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Settings01Icon} />
      </button>
    ),
  },
};

export const Analytics: Story = {
  args: {
    content: "Analytics",
    children: (
      <button
        className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Analytics01Icon} />
      </button>
    ),
  },
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-2">
      <LiaTooltip content="Overview">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Home01Icon} />
        </button>
      </LiaTooltip>

      <LiaTooltip content="Users">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-rausch-50 transition-colors hover:bg-rausch-100"
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={UserGroupIcon} />
        </button>
      </LiaTooltip>

      <LiaTooltip content="Analytics">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Analytics01Icon} />
        </button>
      </LiaTooltip>

      <LiaTooltip content="Settings">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Settings01Icon} />
        </button>
      </LiaTooltip>
    </div>
  ),
};

export const DifferentSides: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <LiaTooltip content="Top" side="top">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          type="button"
        >
          ↑
        </button>
      </LiaTooltip>

      <div className="flex gap-8">
        <LiaTooltip content="Left" side="left">
          <button
            className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
            type="button"
          >
            ←
          </button>
        </LiaTooltip>

        <LiaTooltip content="Right" side="right">
          <button
            className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
            type="button"
          >
            →
          </button>
        </LiaTooltip>
      </div>

      <LiaTooltip content="Bottom" side="bottom">
        <button
          className="flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white transition-colors hover:bg-neutral-50"
          type="button"
        >
          ↓
        </button>
      </LiaTooltip>
    </div>
  ),
};
