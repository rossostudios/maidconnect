import { defineType, defineField } from 'sanity';
import { RocketIcon } from '@sanity/icons';

export default defineType({
  name: 'changelog',
  title: 'Changelog',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'sprintNumber',
      title: 'Sprint Number',
      type: 'number',
      description: 'Sprint number for organization',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Brief summary for changelog listing',
      validation: (Rule) => Rule.required().max(250),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Features', value: 'features' },
          { title: 'Improvements', value: 'improvements' },
          { title: 'Bug Fixes', value: 'bug_fixes' },
          { title: 'Performance', value: 'performance' },
          { title: 'Security', value: 'security' },
          { title: 'Design', value: 'design' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Custom tags for categorization',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'string',
      options: {
        list: [
          { title: 'All Users', value: 'all' },
          { title: 'Customers', value: 'customer' },
          { title: 'Professionals', value: 'professional' },
        ],
      },
      initialValue: 'all',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'en',
      hidden: ({ document }) => !!document?._id,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sprint: 'sprintNumber',
      language: 'language',
      publishedAt: 'publishedAt',
    },
    prepare({ title, sprint, language, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Not published';
      return {
        title: `Sprint ${sprint}: ${title}`,
        subtitle: `${date} | ${language?.toUpperCase() || 'NO LANG'}`,
      };
    },
  },
  orderings: [
    {
      title: 'Sprint Number, Desc',
      name: 'sprintDesc',
      by: [{ field: 'sprintNumber', direction: 'desc' }],
    },
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
