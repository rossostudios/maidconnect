import { defineType } from 'sanity';

export default defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
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
      rows: 2,
    },
    {
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'authorName',
              title: 'Author Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'authorRole',
              title: 'Author Role',
              type: 'string',
              description: 'e.g., "Customer" or "Professional"',
            },
            {
              name: 'authorImage',
              title: 'Author Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'rating',
              title: 'Rating',
              type: 'number',
              description: 'Star rating (1-5)',
              validation: (Rule) => Rule.required().min(1).max(5),
              initialValue: 5,
            },
          ],
          preview: {
            select: {
              title: 'authorName',
              subtitle: 'quote',
              rating: 'rating',
            },
            prepare({ title, subtitle, rating }) {
              return {
                title: title || 'Anonymous',
                subtitle: subtitle || 'No quote',
                description: rating ? `${rating} stars` : undefined,
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      testimonials: 'testimonials',
    },
    prepare({ title, testimonials }) {
      return {
        title: title || 'Testimonials Section',
        subtitle: testimonials ? `${testimonials.length} testimonials` : 'No testimonials',
      };
    },
  },
});
