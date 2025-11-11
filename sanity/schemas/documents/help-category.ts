import { defineType, defineField } from 'sanity';
import { FolderIcon } from '@sanity/icons';

export default defineType({
  name: 'helpCategory',
  title: 'Help Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'HugeIcons icon name (e.g., "Book01", "QuestionMark")',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive categories are hidden from users',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'en',
      hidden: ({ document }) => !!document?._id,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      order: 'displayOrder',
      language: 'language',
      active: 'isActive',
    },
    prepare({ title, order, language, active }) {
      return {
        title: title || 'Untitled',
        subtitle: `Order: ${order} | ${language?.toUpperCase() || 'NO LANG'} ${active ? '✓' : '(inactive)'}`,
      };
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    {
      title: 'Name, A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
});
