import { BookIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "helpArticle",
  title: "Help Article",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary for article listings",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "helpCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "helpTag" }] }],
    }),
    defineField({
      name: "relatedArticles",
      title: "Related Articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "helpArticle" }] }],
      description: "Manually select related articles",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessibility",
        },
      ],
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "en",
      hidden: ({ document }) => !!document?._id, // Hide after document is created (plugin manages it)
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      initialValue: false,
      description: "Published articles are visible to users",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
    }),
    defineField({
      name: "seoMetadata",
      title: "SEO Metadata",
      type: "seoMetadata",
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category.name",
      language: "language",
      published: "isPublished",
    },
    prepare({ title, category, language, published }) {
      return {
        title: title || "Untitled",
        subtitle: `${category || "No category"} | ${language?.toUpperCase() || "NO LANG"} ${published ? "✓" : "(draft)"}`,
      };
    },
  },
  orderings: [
    {
      title: "Published Date, New",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Title, A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
