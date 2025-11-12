// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { MobileMenu } from "./MobileMenu";

const meta = {
  title: "Navigation/MobileMenu",
  component: MobileMenu,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isAuthenticated: {
      control: "boolean",
      description: "Whether the user is logged in",
    },
  },
} satisfies Meta<typeof MobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/professionals", label: "Find Professionals" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export const GuestUser: Story = {
  args: {
    links: navLinks,
    isAuthenticated: false,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50">
        <header className="flex items-center justify-between border-stone-200 border-b bg-white p-4">
          <div className="font-bold text-stone-900 text-xl">Casaora</div>
          <Story />
        </header>
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">Welcome</h1>
          <p className="mt-2 text-stone-600">Click the menu button to open the mobile menu</p>
        </div>
      </div>
    ),
  ],
};

export const AuthenticatedUser: Story = {
  args: {
    links: navLinks,
    isAuthenticated: true,
    dashboardHref: "/dashboard/customer",
    onSignOut: () => console.log("Sign out clicked"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50">
        <header className="flex items-center justify-between border-stone-200 border-b bg-white p-4">
          <div className="font-bold text-stone-900 text-xl">Casaora</div>
          <Story />
        </header>
        <div className="p-4">
          <h1 className="font-bold text-2xl text-stone-900">Welcome Back!</h1>
          <p className="mt-2 text-stone-600">Menu shows dashboard link and logout button</p>
        </div>
      </div>
    ),
  ],
};

export const FewerLinks: Story = {
  args: {
    links: [
      { href: "/", label: "Home" },
      { href: "/professionals", label: "Find Professionals" },
      { href: "/pricing", label: "Pricing" },
    ],
    isAuthenticated: false,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-stone-50">
        <header className="flex items-center justify-between border-stone-200 border-b bg-white p-4">
          <div className="font-bold text-stone-900 text-xl">Casaora</div>
          <Story />
        </header>
      </div>
    ),
  ],
};
