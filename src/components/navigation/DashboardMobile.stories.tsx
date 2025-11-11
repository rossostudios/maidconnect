// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardMobileNav } from "./DashboardMobile";

const meta = {
  title: "Navigation/DashboardMobileNav",
  component: DashboardMobileNav,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    userRole: {
      control: "select",
      options: ["customer", "professional"],
      description: "The user's role (affects labels)",
    },
  },
} satisfies Meta<typeof DashboardMobileNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomerView: Story = {
  args: {
    userRole: "customer",
    dashboardHref: "/dashboard/customer",
    bookingsHref: "/dashboard/customer/bookings",
    messagesHref: "/dashboard/customer/messages",
    profileHref: "/dashboard/customer",
    onNotificationsClick: () => console.log("Notifications clicked"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">Customer Dashboard</h1>
          <p className="mt-2 text-stone-600">Mobile navigation at bottom</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ProfessionalView: Story = {
  args: {
    userRole: "professional",
    dashboardHref: "/dashboard/pro",
    bookingsHref: "/dashboard/pro/bookings",
    messagesHref: "/dashboard/pro/messages",
    profileHref: "/dashboard/pro",
    onNotificationsClick: () => console.log("Notifications clicked"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">Professional Dashboard</h1>
          <p className="mt-2 text-stone-600">Notice "Jobs" instead of "Bookings"</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const WithBadges: Story = {
  args: {
    userRole: "customer",
    dashboardHref: "/dashboard/customer",
    bookingsHref: "/dashboard/customer/bookings",
    messagesHref: "/dashboard/customer/messages",
    profileHref: "/dashboard/customer",
    onNotificationsClick: () => console.log("Notifications clicked"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">Dashboard</h1>
          <p className="mt-2 text-stone-600">With unread badges on Messages and Alerts</p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    mockData: {
      unreadCount: 5,
      notificationUnreadCount: 3,
    },
  },
};

export const ActiveBookings: Story = {
  args: {
    userRole: "customer",
    dashboardHref: "/dashboard/customer",
    bookingsHref: "/dashboard/customer/bookings",
    messagesHref: "/dashboard/customer/messages",
    profileHref: "/dashboard/customer",
    onNotificationsClick: () => console.log("Notifications clicked"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">My Bookings</h1>
          <p className="mt-2 text-stone-600">Bookings tab is active</p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/dashboard/customer/bookings",
      },
    },
  },
};
