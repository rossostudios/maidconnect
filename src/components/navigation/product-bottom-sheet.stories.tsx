// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ProductBottomSheet } from "./product-bottom-sheet";

const meta = {
  title: "Navigation/ProductBottomSheet",
  component: ProductBottomSheet,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const productFeatures = [
  {
    name: "Booking Platform",
    href: "/product/booking-platform",
    description: "Schedule and manage home services with ease",
  },
  {
    name: "Professional Profiles",
    href: "/product/professional-profiles",
    description: "Verified professionals with ratings and reviews",
  },
  {
    name: "Secure Messaging",
    href: "/product/secure-messaging",
    description: "Communicate directly with professionals",
  },
  {
    name: "Payment Processing",
    href: "/product/payment-processing",
    description: "Secure payments with multiple options",
  },
  {
    name: "Reviews & Ratings",
    href: "/product/reviews-ratings",
    description: "Transparent feedback system",
  },
  {
    name: "Admin Dashboard",
    href: "/product/admin-dashboard",
    description: "Powerful tools for platform management",
  },
];

const ProductBottomSheetWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-neutral-200 border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-neutral-900 text-xl">Casaora</div>
          <button
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            View Products
          </button>
        </div>
      </header>
      <div className="p-4">
        <h1 className="font-bold text-2xl text-neutral-900">Product Features</h1>
        <p className="mt-2 text-neutral-600">Click the button to open the bottom sheet</p>
      </div>
      <ProductBottomSheet
        features={productFeatures}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <ProductBottomSheetWrapper />,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const FewerFeatures: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const features = productFeatures.slice(0, 3);

    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="border-neutral-200 border-b bg-white p-4">
          <button
            className="rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-sm text-white transition hover:bg-neutral-800"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            View 3 Features
          </button>
        </header>
        <ProductBottomSheet features={features} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const Landscape: Story = {
  render: () => <ProductBottomSheetWrapper />,
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
};
