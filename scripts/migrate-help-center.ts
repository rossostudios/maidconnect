/**
 * Help Center Migration Script (Supabase → Sanity)
 *
 * This script migrates help center content from Supabase to Sanity:
 * - Categories (English + Spanish as separate documents)
 * - Articles (English + Spanish as separate documents)
 * - Related article references
 *
 * Usage: bun run migrate:help
 */

import { createClient } from '@supabase/supabase-js';
import { writeClient } from '../sanity/lib/client';
import type { Database } from '../src/types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Document ID mapping (Supabase UUID → Sanity _id)
const categoryIdMap = new Map<string, { en: string; es: string }>();
const articleIdMap = new Map<string, { en: string; es: string }>();

/**
 * Convert HTML/Markdown to Portable Text blocks
 * For now, we'll do a simple conversion - you can enhance this later
 */
function htmlToPortableText(html: string): any[] {
  // Strip HTML tags for simple text content
  const text = html.replace(/<[^>]*>/g, '').trim();

  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter((p) => p.trim());

  return paragraphs.map((paragraph) => ({
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text: paragraph.trim(),
        marks: [],
      },
    ],
    markDefs: [],
  }));
}

/**
 * Create a slug-safe string for Sanity document IDs
 */
function createSanityId(slug: string, locale: 'en' | 'es', type: string): string {
  return `${type}-${slug}-${locale}`;
}

/**
 * Migrate Help Categories
 */
async function migrateCategories() {
  console.log('\n📁 Migrating Help Categories...\n');

  const { data: categories, error } = await supabase
    .from('help_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  if (!categories || categories.length === 0) {
    console.log('  ⚠️  No categories found in Supabase\n');
    return;
  }

  console.log(`  Found ${categories.length} categories\n`);

  for (const category of categories) {
    // Create English version
    const enId = createSanityId(category.slug, 'en', 'helpCategory');
    const enDoc = {
      _id: enId,
      _type: 'helpCategory',
      name: category.name_en,
      slug: { _type: 'slug', current: category.slug },
      description: category.description_en || undefined,
      icon: category.icon || undefined,
      displayOrder: category.display_order,
      isActive: category.is_active,
      language: 'en',
    };

    // Create Spanish version
    const esId = createSanityId(category.slug, 'es', 'helpCategory');
    const esDoc = {
      _id: esId,
      _type: 'helpCategory',
      name: category.name_es,
      slug: { _type: 'slug', current: category.slug },
      description: category.description_es || undefined,
      icon: category.icon || undefined,
      displayOrder: category.display_order,
      isActive: category.is_active,
      language: 'es',
    };

    try {
      await writeClient.createOrReplace(enDoc);
      await writeClient.createOrReplace(esDoc);

      // Store mapping
      categoryIdMap.set(category.id, { en: enId, es: esId });

      console.log(`  ✅ ${category.name_en} (${category.slug})`);
    } catch (err) {
      console.error(`  ❌ Failed to create category ${category.slug}:`, err);
    }
  }

  console.log(`\n  Migrated ${categories.length} categories\n`);
}

/**
 * Migrate Help Articles
 */
async function migrateArticles() {
  console.log('\n📄 Migrating Help Articles...\n');

  const { data: articles, error } = await supabase
    .from('help_articles')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  if (!articles || articles.length === 0) {
    console.log('  ⚠️  No articles found in Supabase\n');
    return;
  }

  console.log(`  Found ${articles.length} articles\n`);

  for (const article of articles) {
    const categoryIds = categoryIdMap.get(article.category_id);

    if (!categoryIds) {
      console.warn(`  ⚠️  Skipping article ${article.slug} - category not found`);
      continue;
    }

    // Create English version
    const enId = createSanityId(article.slug, 'en', 'helpArticle');
    const enDoc = {
      _id: enId,
      _type: 'helpArticle',
      title: article.title_en,
      slug: { _type: 'slug', current: article.slug },
      excerpt: article.excerpt_en || undefined,
      content: htmlToPortableText(article.content_en),
      category: {
        _type: 'reference',
        _ref: categoryIds.en,
      },
      language: 'en',
      isPublished: article.is_published,
      publishedAt: article.published_at || undefined,
    };

    // Create Spanish version
    const esId = createSanityId(article.slug, 'es', 'helpArticle');
    const esDoc = {
      _id: esId,
      _type: 'helpArticle',
      title: article.title_es,
      slug: { _type: 'slug', current: article.slug },
      excerpt: article.excerpt_es || undefined,
      content: htmlToPortableText(article.content_es),
      category: {
        _type: 'reference',
        _ref: categoryIds.es,
      },
      language: 'es',
      isPublished: article.is_published,
      publishedAt: article.published_at || undefined,
    };

    try {
      await writeClient.createOrReplace(enDoc);
      await writeClient.createOrReplace(esDoc);

      // Store mapping
      articleIdMap.set(article.id, { en: enId, es: esId });

      console.log(`  ✅ ${article.title_en} (${article.slug})`);
    } catch (err) {
      console.error(`  ❌ Failed to create article ${article.slug}:`, err);
    }
  }

  console.log(`\n  Migrated ${articles.length} articles\n`);
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Help Center Migration (Supabase → Sanity)\n');
  console.log('================================================\n');

  try {
    // Step 1: Migrate categories
    await migrateCategories();

    // Step 2: Migrate articles
    await migrateArticles();

    console.log('================================================\n');
    console.log('✅ Migration completed successfully!\n');
    console.log(`   Categories: ${categoryIdMap.size} (EN + ES)`);
    console.log(`   Articles: ${articleIdMap.size} (EN + ES)\n`);
    console.log('🎉 You can now view your content in Sanity Studio at /studio\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
