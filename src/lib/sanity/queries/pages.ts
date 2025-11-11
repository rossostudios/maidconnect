/**
 * GROQ Queries for Sanity Pages
 */

/**
 * Fetch a page by pageType (e.g., 'homepage', 'about', 'pricing')
 */
export const pageByTypeQuery = `
  *[_type == "page" && pageType == $pageType && language == $language && isPublished == true][0] {
    _id,
    title,
    slug,
    pageType,
    sections[] {
      _type,
      _key,
      ...,
      backgroundImage {
        asset-> {
          _id,
          url
        },
        alt
      },
      testimonials[] {
        ...,
        avatar {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    seoMetadata {
      metaTitle,
      metaDescription,
      ogImage {
        asset-> {
          _id,
          url
        }
      },
      noIndex,
      noFollow
    },
    publishedAt
  }
`;

/**
 * Fetch a page by slug (for custom pages)
 */
export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug && language == $language && isPublished == true][0] {
    _id,
    title,
    slug,
    pageType,
    sections[] {
      _type,
      _key,
      ...,
      backgroundImage {
        asset-> {
          _id,
          url
        },
        alt
      },
      testimonials[] {
        ...,
        avatar {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    seoMetadata {
      metaTitle,
      metaDescription,
      ogImage {
        asset-> {
          _id,
          url
        }
      },
      noIndex,
      noFollow
    },
    publishedAt
  }
`;

/**
 * Fetch all published pages (for sitemap, etc.)
 */
export const allPagesQuery = `
  *[_type == "page" && isPublished == true && language == $language] | order(publishedAt desc) {
    _id,
    title,
    slug,
    pageType,
    publishedAt
  }
`;
