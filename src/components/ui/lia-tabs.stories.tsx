import {
  Building03Icon,
  SecurityLockIcon,
  Settings02Icon,
  ShieldSecurityIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LiaTabs, LiaTabsUnderline } from "./lia-tabs";

const meta = {
  title: "Design System/LiaTabs",
  component: LiaTabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Anthropic-inspired tab navigation with refined minimalism, warm accents, and smooth spring animations. Two variants: contained (default) and underline (editorial).",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LiaTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const settingsTabs = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "security", label: "Security", icon: SecurityLockIcon },
  { id: "platform", label: "Platform", icon: Building03Icon },
  { id: "features", label: "Features", icon: Settings02Icon },
  { id: "integrations", label: "Integrations", icon: ShieldSecurityIcon },
];

/**
 * Default variant with contained background indicator
 */
export const Default: Story = {
  args: {
    tabs: settingsTabs,
    variant: "default",
  },
};

/**
 * Bordered variant with subtle container
 */
export const Bordered: Story = {
  args: {
    tabs: settingsTabs,
    variant: "bordered",
  },
};

/**
 * Underline variant for page-level navigation
 */
export const Underline: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("profile");

    return (
      <div className="w-[600px]">
        <LiaTabsUnderline activeTab={activeTab} onChange={setActiveTab} tabs={settingsTabs} />

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-neutral-700 text-sm">
            Active tab: <span className="font-semibold text-rausch-600">{activeTab}</span>
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Controlled state example
 */
export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("security");

    return (
      <div className="space-y-6">
        <LiaTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={settingsTabs}
          variant="bordered"
        />

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-2 font-semibold text-lg text-neutral-900">
            {settingsTabs.find((t) => t.id === activeTab)?.label} Settings
          </h3>
          <p className="text-neutral-700 text-sm">
            Content for the {activeTab} tab would appear here.
          </p>

          <div className="mt-4 flex gap-2">
            {settingsTabs.map((tab) => (
              <button
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 text-xs transition-colors hover:bg-neutral-50"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                Go to {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Minimal tabs (3 items)
 */
export const Minimal: Story = {
  args: {
    tabs: [
      { id: "profile", label: "Profile", icon: UserIcon },
      { id: "security", label: "Security", icon: SecurityLockIcon },
      { id: "platform", label: "Platform", icon: Building03Icon },
    ],
    variant: "bordered",
  },
};

/**
 * Dark background showcase
 */
export const DarkBackground: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("features");

    return (
      <div className="rounded-lg bg-neutral-900 p-12">
        <LiaTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={settingsTabs}
          variant="bordered"
        />
      </div>
    );
  },
};
