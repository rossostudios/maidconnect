import { defineType } from "sanity";

export default defineType({
  name: "ctaSection",
  title: "CTA Section",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "primaryCtaText",
      title: "Primary CTA Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "primaryCtaLink",
      title: "Primary CTA Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "secondaryCtaText",
      title: "Secondary CTA Text",
      type: "string",
    },
    {
      name: "secondaryCtaLink",
      title: "Secondary CTA Link",
      type: "string",
    },
    {
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Gray", value: "gray" },
          { title: "White", value: "white" },
        ],
      },
      initialValue: "red",
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "primaryCtaText",
    },
  },
});
