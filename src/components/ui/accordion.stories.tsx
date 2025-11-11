// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "minimal"],
    },
    allowMultiple: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default accordion
export const Default: Story = {
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
        <AccordionContent>
          We accept all major credit cards, debit cards, and digital payment methods including Apple
          Pay and Google Pay. All payments are processed securely through our payment provider.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel or reschedule a booking?</AccordionTrigger>
        <AccordionContent>
          You can cancel or reschedule your booking up to 24 hours before the scheduled time through
          your dashboard. Simply navigate to your bookings and select the appropriate option.
          Cancellations made within 24 hours may incur a fee.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Are professionals background checked?</AccordionTrigger>
        <AccordionContent>
          Yes, all professionals go through a comprehensive vetting process including background
          checks, identity verification, and reference checks to ensure your safety and peace of
          mind.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Bordered variant
export const Bordered: Story = {
  render: () => (
    <Accordion className="w-[600px]" variant="bordered">
      <AccordionItem value="item-1">
        <AccordionTrigger>Pricing & Payments</AccordionTrigger>
        <AccordionContent>
          Our pricing is transparent with no hidden fees. You'll see the full cost before booking,
          and payment is only processed after the service is completed to your satisfaction.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Service Guarantee</AccordionTrigger>
        <AccordionContent>
          We stand behind the quality of our services. If you're not satisfied, we'll work with you
          to make it right or provide a full refund.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Minimal variant
export const Minimal: Story = {
  render: () => (
    <Accordion className="w-[600px]" variant="minimal">
      <AccordionItem value="item-1">
        <AccordionTrigger>Documentation</AccordionTrigger>
        <AccordionContent>
          Access comprehensive guides, API references, and tutorials in our documentation portal.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Support</AccordionTrigger>
        <AccordionContent>
          Our support team is available 24/7 to help with any questions or issues you may have.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Community</AccordionTrigger>
        <AccordionContent>
          Join our community forum to connect with other users and share best practices.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Multiple open items
export const AllowMultiple: Story = {
  render: () => (
    <Accordion allowMultiple className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Feature 1</AccordionTrigger>
        <AccordionContent>You can open multiple items at once.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Feature 2</AccordionTrigger>
        <AccordionContent>Try opening this while the first is open.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Feature 3</AccordionTrigger>
        <AccordionContent>All three can be open simultaneously.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
