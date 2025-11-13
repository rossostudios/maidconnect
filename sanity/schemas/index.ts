// Document types

import blogCategory from "./documents/blog-category";
import blogPost from "./documents/blog-post";
import changelog from "./documents/changelog";
import cityPage from "./documents/city-page";
import helpArticle from "./documents/help-article";
import helpCategory from "./documents/help-category";
import helpTag from "./documents/help-tag";
import page from "./documents/page";
import roadmapItem from "./documents/roadmap-item";

// Object types
import blockContent from "./objects/block-content";
import ctaSection from "./objects/cta-section";
import faqSection from "./objects/faq-section";
import featuresSection from "./objects/features-section";
import heroSection from "./objects/hero-section";
import seoMetadata from "./objects/seo-metadata";
import statsSection from "./objects/stats-section";
import testimonialsSection from "./objects/testimonials-section";

export const schemaTypes = [
  // Documents
  helpArticle,
  helpCategory,
  helpTag,
  changelog,
  roadmapItem,
  page,
  cityPage,
  blogCategory,
  blogPost,

  // Objects
  blockContent,
  seoMetadata,
  heroSection,
  featuresSection,
  statsSection,
  testimonialsSection,
  ctaSection,
  faqSection,
];
