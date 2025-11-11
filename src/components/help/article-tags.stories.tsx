// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleTags } from "./article-tags";

const meta = {
  title: "Communication/Help/ArticleTags",
  component: ArticleTags,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArticleTags>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTags = [
  {
    id: "1",
    slug: "getting-started",
    name_en: "Getting Started",
    name_es: "Empezando",
    color: "blue",
  },
  { id: "2", slug: "billing", name_en: "Billing", name_es: "Facturación", color: "green" },
  {
    id: "3",
    slug: "troubleshooting",
    name_en: "Troubleshooting",
    name_es: "Solución de problemas",
    color: "red",
  },
];

export const Default: Story = {
  args: {
    tags: mockTags,
    locale: "en",
  },
};

export const Spanish: Story = {
  args: {
    tags: mockTags,
    locale: "es",
  },
};

export const SingleTag: Story = {
  args: {
    tags: [mockTags[0]],
    locale: "en",
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      ...mockTags,
      { id: "4", slug: "account", name_en: "Account", name_es: "Cuenta", color: "purple" },
      { id: "5", slug: "security", name_en: "Security", name_es: "Seguridad", color: "orange" },
    ],
    locale: "en",
  },
};
