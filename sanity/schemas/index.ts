// Document types
import helpArticle from './documents/help-article';
import helpCategory from './documents/help-category';
import helpTag from './documents/help-tag';
import changelog from './documents/changelog';
import roadmapItem from './documents/roadmap-item';
import page from './documents/page';
import cityPage from './documents/city-page';

// Object types
import blockContent from './objects/block-content';
import seoMetadata from './objects/seo-metadata';
import heroSection from './objects/hero-section';
import featuresSection from './objects/features-section';
import statsSection from './objects/stats-section';
import testimonialsSection from './objects/testimonials-section';
import ctaSection from './objects/cta-section';
import faqSection from './objects/faq-section';

export const schemaTypes = [
  // Documents
  helpArticle,
  helpCategory,
  helpTag,
  changelog,
  roadmapItem,
  page,
  cityPage,

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
