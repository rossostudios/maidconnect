import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons';

export default defineType({
  name: 'cityPage',
  title: 'City Page',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'cityName',
      title: 'City Name',
      type: 'string',
      description: 'e.g., "Bogotá", "Medellín"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'citySlug',
      title: 'City Slug',
      type: 'slug',
      options: {
        source: 'cityName',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main H1 title for the city page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'City hero image',
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
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Detailed description of services in this city',
    }),
    defineField({
      name: 'neighborhoodsServed',
      title: 'Neighborhoods Served',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of neighborhoods served in this city',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'localBusinessSchema',
      title: 'Local Business Schema',
      type: 'object',
      description: 'Structured data for SEO (LocalBusiness Schema)',
      fields: [
        {
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'addressLocality',
          title: 'Address Locality',
          type: 'string',
          description: 'City name',
        },
        {
          name: 'addressRegion',
          title: 'Address Region',
          type: 'string',
          description: 'State/Region',
        },
        {
          name: 'addressCountry',
          title: 'Address Country',
          type: 'string',
          description: 'Country code (e.g., "CO")',
          initialValue: 'CO',
        },
        {
          name: 'telephone',
          title: 'Telephone',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'es', // Default to Spanish for Colombian cities
      hidden: ({ document }) => !!document?._id,
    }),
    defineField({
      name: 'seoMetadata',
      title: 'SEO Metadata',
      type: 'seoMetadata',
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'cityName',
      language: 'language',
      published: 'isPublished',
    },
    prepare({ title, language, published }) {
      return {
        title: title || 'Untitled City',
        subtitle: `${language?.toUpperCase() || 'NO LANG'} ${published ? '✓' : '(draft)'}`,
      };
    },
  },
  orderings: [
    {
      title: 'City Name, A-Z',
      name: 'cityNameAsc',
      by: [{ field: 'cityName', direction: 'asc' }],
    },
  ],
});
