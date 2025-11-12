import { defineType } from "sanity";

/**
 * SEO Metadata for pages, articles, and other content
 * Includes title, description, Open Graph, and Twitter Card data
 */
export default defineType({
  name: "seoMetadata",
  title: "SEO Metadata",
  type: "object",
  fields: [
    {
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "SEO title (50-60 characters recommended)",
      validation: (Rule) => Rule.max(60).warning("Should be 50-60 characters for optimal SEO"),
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
      description: "SEO description (150-160 characters recommended)",
      validation: (Rule) => Rule.max(160).warning("Should be 150-160 characters for optimal SEO"),
    },
    {
      name: "keywords",
      title: "Focus Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "SEO keywords (optional, but helpful for content strategy)",
      options: {
        layout: "tags",
      },
    },
    {
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      description: "Image for social sharing (1200x630px recommended)",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
        },
      ],
      options: {
        hotspot: true,
      },
    },
    {
      name: "ogTitle",
      title: "Open Graph Title",
      type: "string",
      description: "Title for social sharing (optional, falls back to Meta Title)",
    },
    {
      name: "ogDescription",
      title: "Open Graph Description",
      type: "text",
      rows: 2,
      description: "Description for social sharing (optional, falls back to Meta Description)",
    },
    {
      name: "twitterCard",
      title: "Twitter Card Type",
      type: "string",
      options: {
        list: [
          { title: "Summary", value: "summary" },
          { title: "Summary Large Image", value: "summary_large_image" },
        ],
        layout: "radio",
      },
      initialValue: "summary_large_image",
    },
    {
      name: "noIndex",
      title: "No Index",
      type: "boolean",
      description: "Prevent search engines from indexing this page",
      initialValue: false,
    },
    {
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description: "Specify a canonical URL if this is duplicate content",
    },
  ],
  preview: {
    select: {
      title: "metaTitle",
      subtitle: "metaDescription",
    },
  },
});
