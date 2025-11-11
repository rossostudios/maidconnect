import { defineType, defineField } from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
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
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'About', value: 'about' },
          { title: 'Pricing', value: 'pricing' },
          { title: 'How It Works', value: 'how-it-works' },
          { title: 'Contact', value: 'contact' },
          { title: 'Careers', value: 'careers' },
          { title: 'Custom', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'featuresSection' },
        { type: 'statsSection' },
        { type: 'testimonialsSection' },
        { type: 'ctaSection' },
        { type: 'faqSection' },
      ],
      description: 'Build your page by adding sections',
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
      title: 'title',
      pageType: 'pageType',
      language: 'language',
      published: 'isPublished',
    },
    prepare({ title, pageType, language, published }) {
      return {
        title: title || 'Untitled',
        subtitle: `${pageType || 'custom'} | ${language?.toUpperCase() || 'NO LANG'} ${published ? '✓' : '(draft)'}`,
      };
    },
  },
});
