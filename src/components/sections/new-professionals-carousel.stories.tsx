// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { NewProfessionalsCarousel } from "./new-professionals-carousel";

const meta = {
  title: "Sections/NewProfessionalsCarousel",
  component: NewProfessionalsCarousel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NewProfessionalsCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProfessionals = [
  {
    id: "1",
    name: "Maria Rodriguez",
    city: "Bogotá",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    hourlyRate: 25,
    specialties: ["Housekeeping", "Deep Cleaning"],
  },
  {
    id: "2",
    name: "Carlos Mendez",
    city: "Medellín",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    hourlyRate: 30,
    specialties: ["Childcare", "Tutoring"],
  },
  {
    id: "3",
    name: "Sofia Garcia",
    city: "Cali",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    hourlyRate: 28,
    specialties: ["Elder Care", "Companionship"],
  },
  {
    id: "4",
    name: "Juan Lopez",
    city: "Cartagena",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
    hourlyRate: 32,
    specialties: ["Pet Care", "Dog Walking"],
  },
  {
    id: "5",
    name: "Ana Martinez",
    city: "Barranquilla",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    hourlyRate: 27,
    specialties: ["Cooking", "Meal Prep"],
  },
  {
    id: "6",
    name: "Diego Hernandez",
    city: "Bucaramanga",
    country: "Colombia",
    profilePicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
    hourlyRate: 29,
    specialties: ["Gardening", "Landscaping"],
  },
];

// Default story with multiple professionals
export const Default: Story = {
  args: {
    professionals: mockProfessionals,
  },
};

// Empty state (carousel doesn't render)
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

// Three professionals (minimum visible on desktop)
export const ThreeProfessionals: Story = {
  args: {
    professionals: mockProfessionals.slice(0, 3),
  },
};

// Professional with no profile picture
export const NoProfilePicture: Story = {
  args: {
    professionals: [
      {
        ...mockProfessionals[0],
        profilePicture: null,
      },
    ],
  },
};
