// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerSearchSection } from "./customer-search-section";

const meta = {
  title: "Sections/CustomerSearchSection",
  component: CustomerSearchSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerSearchSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProfessionals = [
  {
    id: "1",
    name: "Maria Rodriguez",
    service: "Housekeeping & Deep Cleaning",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    languages: ["English", "Spanish"],
    location: "Bogotá, Colombia",
    bio: "Experienced housekeeper with 5+ years serving families in Bogotá. I specialize in deep cleaning and organizing spaces to create comfortable, welcoming homes.",
    hourlyRateCop: 25_000,
  },
  {
    id: "2",
    name: "Carlos Mendez",
    service: "Childcare & Tutoring",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    languages: ["English", "Spanish"],
    location: "Medellín, Colombia",
    bio: "Dedicated childcare professional with certification in early childhood education. I create safe, fun learning environments for children.",
    hourlyRateCop: 30_000,
  },
  {
    id: "3",
    name: "Sofia Garcia",
    service: "Elder Care & Companionship",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    languages: ["English", "Spanish"],
    location: "Cali, Colombia",
    bio: "Compassionate caregiver with nursing background. I provide professional elder care services with patience and respect.",
    hourlyRateCop: 28_000,
  },
];

// Default story with professionals
export const Default: Story = {
  args: {
    professionals: mockProfessionals,
  },
};

// Empty state with no professionals
export const EmptyState: Story = {
  args: {
    professionals: [],
  },
};

// Single professional
export const SingleProfessional: Story = {
  args: {
    professionals: [mockProfessionals[0]],
  },
};

// Two professionals
export const TwoProfessionals: Story = {
  args: {
    professionals: mockProfessionals.slice(0, 2),
  },
};

// Professional with long bio
export const LongBio: Story = {
  args: {
    professionals: [
      {
        ...mockProfessionals[0],
        bio: "I am an experienced professional housekeeper with over 10 years of experience serving families throughout Colombia. I take pride in creating clean, organized, and welcoming spaces that families can truly enjoy. My attention to detail and commitment to excellence sets me apart.",
      },
    ],
  },
};

// Professional with no bio
export const NoBio: Story = {
  args: {
    professionals: [
      {
        ...mockProfessionals[0],
        bio: "",
      },
    ],
  },
};

// Professional with no languages
export const NoLanguages: Story = {
  args: {
    professionals: [
      {
        ...mockProfessionals[0],
        languages: [],
      },
    ],
  },
};
