// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardNavigation } from "./dashboard-navigation";

const meta = {
  title: "Navigation/DashboardNavigation",
  component: DashboardNavigation,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    userRole: {
      control: "select",
      options: ["customer", "professional"],
      description: "The user's role",
    },
  },
} satisfies Meta<typeof DashboardNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const customerNavLinks = [
  { href: "/dashboard/customer", label: "Overview" },
  { href: "/dashboard/customer/bookings", label: "Bookings" },
  { href: "/dashboard/customer#addresses", label: "Addresses" },
  { href: "/dashboard/customer#favorites", label: "Favorites" },
];

const proNavLinks = [
  { href: "/dashboard/pro", label: "Overview" },
  { href: "/dashboard/pro/bookings", label: "Jobs" },
  { href: "/dashboard/pro/availability", label: "Availability" },
  { href: "/dashboard/pro/profile", label: "Profile" },
];

export const CustomerDesktop: Story = {
  args: {
    userRole: "customer",
    navLinks: customerNavLinks,
  },
  decorators: [
    (Story) => (
      <div className="w-full border-neutral-200 border-b bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export const ProfessionalDesktop: Story = {
  args: {
    userRole: "professional",
    navLinks: proNavLinks,
  },
  decorators: [
    (Story) => (
      <div className="w-full border-neutral-200 border-b bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export const WithUnreadMessages: Story = {
  args: {
    userRole: "customer",
    navLinks: customerNavLinks,
  },
  decorators: [
    (Story) => (
      <div className="w-full border-neutral-200 border-b bg-white p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    mockData: {
      unreadCount: 5,
      notificationUnreadCount: 0,
    },
  },
};

export const WithAllBadges: Story = {
  args: {
    userRole: "professional",
    navLinks: proNavLinks,
  },
  decorators: [
    (Story) => (
      <div className="w-full border-neutral-200 border-b bg-white p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    mockData: {
      unreadCount: 10,
      notificationUnreadCount: 5,
    },
  },
};
