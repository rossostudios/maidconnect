import { defineType } from "sanity";

export default defineType({
  name: "statsSection",
  title: "Stats Section",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Section Title",
      type: "string",
    },
    {
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "value",
              title: "Value",
              type: "string",
              description: 'e.g., "10,000+" or "98%"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "label",
              title: "Label",
              type: "string",
              description: 'e.g., "Happy Customers" or "On-Time Rate"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "icon",
              title: "Icon Name (optional)",
              type: "string",
              description: "HugeIcons icon name",
            },
          ],
          preview: {
            select: {
              value: "value",
              label: "label",
            },
            prepare({ value, label }) {
              return {
                title: `${value} - ${label}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(6),
    },
  ],
  preview: {
    select: {
      title: "title",
      stats: "stats",
    },
    prepare({ title, stats }) {
      return {
        title: title || "Stats Section",
        subtitle: stats ? `${stats.length} stats` : "No stats",
      };
    },
  },
});
