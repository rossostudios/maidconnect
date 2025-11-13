# Sanity Blog Setup Guide

This guide will walk you through setting up the blog schema in Sanity CMS and adding your first blog post.

## Step 1: Access Sanity Studio

1. Open your Sanity Studio by navigating to:
   - Local: `http://localhost:3000/studio`
   - Production: `https://casaora.vercel.app/studio`

2. Sign in with your Sanity account

## Step 2: Create Blog Schema (if not exists)

You'll need to create the following schema documents in your Sanity Studio:

### Blog Category Schema

```typescript
// schemas/blogCategory.ts
export default {
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Spanish', value: 'es' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
  ],
};
```

### Blog Post Schema

```typescript
// schemas/blogPost.ts
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief summary (2-3 sentences)',
      validation: (Rule) => Rule.required().max(300),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'External Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                  },
                ],
              },
            ],
          },
        },
        {
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
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {
          type: 'code',
          options: {
            language: 'javascript',
            languageAlternatives: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Bash', value: 'bash' },
            ],
          },
        },
      ],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'blogCategory' }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
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
    },
    {
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'Estimated reading time in minutes',
    },
    {
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'isFeatured',
      title: 'Featured Post',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Spanish', value: 'es' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'seoMetadata',
      title: 'SEO Metadata',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          validation: (Rule) => Rule.max(160),
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
};
```

## Step 3: Create Your First Category

1. In Sanity Studio, click **+ Create** → **Blog Category**
2. Fill in the fields:
   - **Category Name**: `Company Updates`
   - **Slug**: Click "Generate" (will create: `company-updates`)
   - **Description**: `News, announcements, and updates from the Casaora team`
   - **Language**: `English (en)`
3. Click **Publish**

## Step 4: Add Your First Blog Post

1. In Sanity Studio, click **+ Create** → **Blog Post**
2. Fill in the fields:

### Basic Info
- **Title**: `Introducing Casaora`
- **Slug**: Click "Generate" (will create: `introducing-casaora`)
- **Excerpt**: `Helping families in Colombia hire trusted household staff – with concierge-level care. Learn about our mission to bridge the gap between families and exceptional domestic professionals.`
- **Author**: `Chris` (or your name)
- **Category**: Select `Company Updates`
- **Tags**: Add tags like `announcement`, `company`, `mission`

### Content
Copy and paste your blog post content from the draft you provided. The Portable Text editor supports:
- **Headings**: Use H1, H2, H3 for structure
- **Bold/Italic**: Format text for emphasis
- **Links**: Highlight text and add links
- **Lists**: Use bullet points or numbered lists
- **Blockquotes**: For pull quotes
- **Code blocks**: For technical content

### Featured Image
1. Click **Upload** under Featured Image
2. Select an image that represents your post
3. Add **Alternative text**: `Casaora homepage hero section`

### Publishing
- **Reading Time**: `8` (approximate minutes)
- **Published**: Toggle **ON**
- **Featured Post**: Toggle **ON** (to showcase it)
- **Published At**: Select today's date
- **Language**: `English (en)`

### SEO (Optional)
- **Meta Title**: `Introducing Casaora - Trusted Household Staffing in Colombia`
- **Meta Description**: `Discover how Casaora is transforming household staffing in Colombia with vetted professionals and concierge-level service.`

3. Click **Publish** at the bottom

## Step 5: View Your Blog

Your blog is now live! Visit:
- **Blog Listing**: `http://localhost:3000/en/blog` (local) or `https://casaora.vercel.app/en/blog` (production)
- **Blog Post**: `http://localhost:3000/en/blog/introducing-casaora`

## Tips for Writing Blog Posts

### Content Structure
1. **Opening Hook**: Start with a compelling problem or story
2. **Main Content**: Break into sections with H2/H3 headings
3. **Examples**: Use real scenarios and data
4. **Call to Action**: End with next steps for readers

### Formatting Best Practices
- **Short paragraphs**: 2-4 sentences max for readability
- **Subheadings**: Every 200-300 words to break up content
- **Lists**: Use bullet points for features/benefits
- **Bold key points**: Highlight important takeaways
- **Links**: Link to relevant pages (Concierge, Marketplace, etc.)

### SEO Optimization
- **Title**: Include primary keyword, keep under 60 characters
- **Excerpt**: Compelling summary with keywords, 150-300 characters
- **Headings**: Use H2/H3 with relevant keywords
- **Internal Links**: Link to other pages on your site
- **Alt Text**: Describe images for accessibility and SEO

## Translations (Spanish)

To create a Spanish version:

1. **Create Spanish Category** (if needed):
   - Name: `Actualizaciones de la Empresa`
   - Slug: `actualizaciones-de-la-empresa`
   - Language: `Spanish (es)`

2. **Duplicate English Post**:
   - Copy the English post content
   - Create new Blog Post
   - Change Language to `Spanish (es)`
   - Translate all content
   - Use Spanish category reference

## Next Steps

1. **Add Navigation Link**: Consider adding a "Blog" link to your main navigation in the SiteHeader component
2. **Create More Categories**: Add categories like `Industry Insights`, `Tips & Guides`, `Success Stories`
3. **Regular Publishing**: Aim for 1-2 posts per month
4. **Email Newsletter**: Share blog posts with your email list
5. **Social Media**: Promote posts on LinkedIn, Twitter, Facebook

## Schema Files Location

If you need to manually add these schemas, they should go in:
```
/sanity/schemas/
├── blogCategory.ts
└── blogPost.ts
```

Then import them in your schema index file:
```typescript
// sanity/schemas/index.ts
import blogCategory from './blogCategory';
import blogPost from './blogPost';

export const schemaTypes = [
  // ... other schemas
  blogCategory,
  blogPost,
];
```

## Troubleshooting

### "Document type not found"
- Make sure you've deployed your schema changes to Sanity
- Run `sanity deploy` in your Sanity project folder

### "Images not loading"
- Verify image assets are uploaded in Sanity
- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` environment variable is set

### "Content not showing"
- Verify **isPublished** is toggled ON
- Check **publishedAt** date is not in the future
- Confirm **language** matches your locale (en/es)

## Support

If you need help:
- Sanity Documentation: https://www.sanity.io/docs
- Your project schema reference in the Studio
- Contact Sanity support for technical issues

---

**Ready to launch your blog!** 🚀

Start by creating your first category, then publish your "Introducing Casaora" post. The blog pages are already built and ready to display your content.
