import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
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
      description: "Brief summary (2-3 sentences) shown on blog listing",
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
      description: "Full blog post content with rich text formatting",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Author name (e.g., 'Chris' or 'Casaora Team')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "blogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Tags for categorization and SEO",
      options: {
        layout: "tags",
      },
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
          description: "Describe the image for accessibility and SEO",
        },
      ],
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (minutes)",
      type: "number",
      description: "Estimated reading time in minutes (e.g., 5, 8, 12)",
      validation: (Rule) => Rule.positive().integer(),
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      description: "Toggle to publish/unpublish this post",
      initialValue: false,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured Post",
      type: "boolean",
      description: "Mark as featured to highlight on homepage or blog",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "en",
      hidden: ({ document }) => !!document?._id,
    }),
    defineField({
      name: "seoMetadata",
      title: "SEO Metadata",
      type: "seoMetadata",
      description: "Optional custom SEO fields (defaults to title/excerpt if not set)",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      media: "featuredImage",
      language: "language",
      isPublished: "isPublished",
      publishedAt: "publishedAt",
    },
    prepare({ title, author, media, language, isPublished, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : "No date";
      const status = isPublished ? "✓" : "Draft";
      return {
        title: title,
        subtitle: `${status} | ${author} | ${date} | ${language?.toUpperCase() || "NO LANG"}`,
        media: media,
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
