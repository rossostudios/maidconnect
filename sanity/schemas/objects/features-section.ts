import { defineType } from 'sanity';

export default defineType({
  name: 'featuresSection',
  title: 'Features Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon Name',
              type: 'string',
              description: 'HugeIcons icon name (e.g., "Sparkles01", "Shield01")',
            },
            {
              name: 'title',
              title: 'Feature Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Feature Description',
              type: 'text',
              rows: 2,
            },
            {
              name: 'link',
              title: 'Learn More Link (optional)',
              type: 'string',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              icon: 'icon',
            },
            prepare({ title, subtitle, icon }) {
              return {
                title: title || 'Untitled Feature',
                subtitle: subtitle,
                media: icon ? undefined : undefined, // Can add icon preview later
              };
            },
          },
        },
      ],
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (3 columns)', value: 'grid-3' },
          { title: 'Grid (4 columns)', value: 'grid-4' },
          { title: 'List', value: 'list' },
        ],
      },
      initialValue: 'grid-3',
    },
  ],
  preview: {
    select: {
      title: 'title',
      features: 'features',
    },
    prepare({ title, features }) {
      return {
        title: title || 'Features Section',
        subtitle: features ? `${features.length} features` : 'No features',
      };
    },
  },
});
