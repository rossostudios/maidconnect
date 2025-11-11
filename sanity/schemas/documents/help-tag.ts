import { defineType, defineField } from 'sanity';
import { TagIcon } from '@sanity/icons';

export default defineType({
  name: 'helpTag',
  title: 'Help Tag',
  type: 'document',
  icon: TagIcon,
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
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Color for tag display (e.g., "blue", "green", "red")',
      options: {
        list: [
          { title: 'Blue', value: 'blue' },
          { title: 'Green', value: 'green' },
          { title: 'Red', value: 'red' },
          { title: 'Yellow', value: 'yellow' },
          { title: 'Purple', value: 'purple' },
          { title: 'Gray', value: 'gray' },
        ],
      },
      initialValue: 'blue',
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
      color: 'color',
      language: 'language',
    },
    prepare({ title, color, language }) {
      return {
        title: title || 'Untitled',
        subtitle: `${color || 'No color'} | ${language?.toUpperCase() || 'NO LANG'}`,
      };
    },
  },
});
