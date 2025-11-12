import { defineType } from "sanity";

export default defineType({
  name: "heroSection",
  title: "Hero Section",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
    },
    {
      name: "ctaLink",
      title: "CTA Button Link",
      type: "string",
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
      name: "showSearchBar",
      title: "Show Search Bar",
      type: "boolean",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
    },
  },
});
