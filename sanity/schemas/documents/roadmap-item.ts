import { defineType, defineField } from 'sanity';
import { BulbOutlineIcon } from '@sanity/icons';

export default defineType({
  name: 'roadmapItem',
  title: 'Roadmap Item',
  type: 'document',
  icon: BulbOutlineIcon,
  fields: [
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
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Under Consideration', value: 'under_consideration' },
          { title: 'Planned', value: 'planned' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Shipped', value: 'shipped' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'under_consideration',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Features', value: 'features' },
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'UI/UX', value: 'ui_ux' },
          { title: 'Security', value: 'security' },
          { title: 'Integrations', value: 'integrations' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
        ],
      },
      initialValue: 'medium',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetQuarter',
      title: 'Target Quarter',
      type: 'string',
      description: 'e.g., "Q1 2025", "Q2 2025"',
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
      name: 'changelogReference',
      title: 'Changelog Reference',
      type: 'reference',
      to: [{ type: 'changelog' }],
      description: 'Link to changelog entry when feature is shipped',
      hidden: ({ document }) => document?.status !== 'shipped',
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
      name: 'shippedAt',
      title: 'Shipped At',
      type: 'datetime',
      description: 'Date when feature was shipped',
      hidden: ({ document }) => document?.status !== 'shipped',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      category: 'category',
      language: 'language',
      priority: 'priority',
    },
    prepare({ title, status, category, language, priority }) {
      const statusEmoji = {
        under_consideration: '💭',
        planned: '📋',
        in_progress: '🚧',
        shipped: '✅',
      };

      const priorityEmoji = {
        low: '🔵',
        medium: '🟡',
        high: '🔴',
      };

      return {
        title: `${statusEmoji[status as keyof typeof statusEmoji] || ''} ${title}`,
        subtitle: `${priorityEmoji[priority as keyof typeof priorityEmoji] || ''} ${category} | ${language?.toUpperCase() || 'NO LANG'}`,
      };
    },
  },
  orderings: [
    {
      title: 'Priority (High to Low)',
      name: 'priorityDesc',
      by: [
        { field: 'priority', direction: 'desc' },
        { field: 'title', direction: 'asc' },
      ],
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
});
