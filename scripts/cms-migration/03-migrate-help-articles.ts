#!/usr/bin/env bun

/**
 * CMS Migration - Step 3: Migrate Help Articles
 *
 * Migrates help articles from Supabase to Sanity.
 * Converts markdown content to Portable Text and handles bilingual content.
 *
 * Usage:
 *   bun run scripts/cms-migration/03-migrate-help-articles.ts
 *   bun run scripts/cms-migration/03-migrate-help-articles.ts --dry-run
 */

import { createClient as createSanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

console.log("📝 CMS Migration - Step 3: Help Articles");
console.log("=========================================\n");

if (DRY_RUN) {
	console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

const sanityClient = createSanityClient({
	projectId: "7j0vrfmg",
	dataset: "production",
	token: process.env.SANITY_TOKEN,
	apiVersion: "2024-12-12",
	useCdn: false,
});

interface HelpArticle {
	id: string;
	slug: string;
	title_en: string;
	title_es: string;
	content_en: string;
	content_es: string;
	meta_description_en: string;
	meta_description_es: string;
	category_slug: string;
	tags: string[];
	published: boolean;
	featured: boolean;
	author_name: string;
	created_at: string;
	updated_at: string;
}

/**
 * Convert markdown to Portable Text
 * This is a simplified converter - for production, use @sanity/block-tools
 */
function markdownToPortableText(markdown: string) {
	// Split into paragraphs
	const paragraphs = markdown.split("\n\n").filter((p) => p.trim());

	return paragraphs.map((paragraph) => {
		// Check for headings
		if (paragraph.startsWith("### ")) {
			return {
				_type: "block",
				_key: crypto.randomUUID(),
				style: "h3",
				children: [
					{
						_type: "span",
						_key: crypto.randomUUID(),
						text: paragraph.replace("### ", ""),
						marks: [],
					},
				],
			};
		}

		if (paragraph.startsWith("## ")) {
			return {
				_type: "block",
				_key: crypto.randomUUID(),
				style: "h2",
				children: [
					{
						_type: "span",
						_key: crypto.randomUUID(),
						text: paragraph.replace("## ", ""),
						marks: [],
					},
				],
			};
		}

		// Regular paragraph
		return {
			_type: "block",
			_key: crypto.randomUUID(),
			style: "normal",
			children: [
				{
					_type: "span",
					_key: crypto.randomUUID(),
					text: paragraph,
					marks: [],
				},
			],
		};
	});
}

async function migrateArticles() {
	console.log("📥 Fetching help articles from Supabase...\n");

	try {
		// Fetch articles from Supabase
		const { data: articles, error } = await supabase
			.from("help_articles")
			.select("*")
			.order("created_at");

		if (error) {
			if (error.message.includes("does not exist")) {
				console.log("⚠️  Table 'help_articles' not found");
				console.log("   Articles may already be migrated or table was never created.\n");
				console.log("💡 Manual Step: Create articles in Sanity Studio:");
				console.log("   1. Go to http://localhost:3000/studio");
				console.log("   2. Navigate to 'Help Articles'");
				console.log("   3. Create articles manually\n");
				return;
			}
			throw error;
		}

		if (!articles || articles.length === 0) {
			console.log("⚠️  No articles found in Supabase\n");
			console.log("💡 Manual Step: Create articles in Sanity Studio\n");
			return;
		}

		console.log(`✅ Found ${articles.length} articles in Supabase\n`);

		// Fetch categories and tags from Sanity
		const [categories, tags] = await Promise.all([
			sanityClient.fetch(`*[_type == "helpCategory"] { _id, "slug": slug.current }`),
			sanityClient.fetch(`*[_type == "helpTag"] { _id, "slug": slug.current }`),
		]);

		console.log(`📊 Found ${categories.length} categories and ${tags.length} tags in Sanity\n`);

		// Check existing articles in Sanity
		const existingArticles = await sanityClient.fetch(
			`*[_type == "helpArticle"] { _id, "slug": slug.current }`,
		);

		console.log(`📊 Found ${existingArticles.length} existing articles in Sanity\n`);

		// Migrate each article
		let created = 0;
		let skipped = 0;
		let failed = 0;

		for (const article of articles as HelpArticle[]) {
			const exists = existingArticles.find(
				(a: { slug: string }) => a.slug === article.slug,
			);

			if (exists) {
				console.log(`⏭️  Skipping "${article.title_en}" (already exists in Sanity)`);
				skipped++;
				continue;
			}

			if (DRY_RUN) {
				console.log(`🔍 Would create article: "${article.title_en}" (${article.slug})`);
				created++;
				continue;
			}

			try {
				// Find category reference
				const category = categories.find((c: { slug: string }) => c.slug === article.category_slug);

				if (!category) {
					console.log(`⚠️  Category "${article.category_slug}" not found for article "${article.title_en}"`);
					console.log("   Skipping article - migrate categories first\n");
					skipped++;
					continue;
				}

				// Find tag references
				const tagReferences = article.tags
					.map((tagSlug: string) => {
						const tag = tags.find((t: { slug: string }) => t.slug === tagSlug);
						if (tag) {
							return { _type: "reference", _ref: tag._id };
						}
						return null;
					})
					.filter((ref: unknown) => ref !== null);

				// Convert markdown to Portable Text
				const contentEn = markdownToPortableText(article.content_en);
				const contentEs = markdownToPortableText(article.content_es);

				// Create English version (default)
				const sanityArticleEn = {
					_type: "helpArticle",
					slug: { _type: "slug", current: article.slug },
					title: article.title_en,
					content: contentEn,
					excerpt: article.meta_description_en,
					category: { _type: "reference", _ref: category._id },
					tags: tagReferences,
					published: article.published,
					featured: article.featured,
					author: article.author_name || "Casaora Team",
					language: "en",
					seo: {
						_type: "seoMetadata",
						title: article.title_en,
						description: article.meta_description_en,
					},
				};

				const createdEn = await sanityClient.create(sanityArticleEn);
				console.log(`✅ Created English article: "${article.title_en}"`);

				// Create Spanish translation
				const sanityArticleEs = {
					...sanityArticleEn,
					_id: `${createdEn._id}__i18n_es`,
					title: article.title_es,
					content: contentEs,
					excerpt: article.meta_description_es,
					language: "es",
					seo: {
						_type: "seoMetadata",
						title: article.title_es,
						description: article.meta_description_es,
					},
				};

				await sanityClient.create(sanityArticleEs);
				console.log(`✅ Created Spanish translation: "${article.title_es}"\n`);

				created++;
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.error(`❌ Failed to create article "${article.title_en}":`, error.message);
				} else {
					console.error(`❌ Failed to create article "${article.title_en}":`, error);
				}
				failed++;
			}
		}

		// Summary
		console.log("\n📊 Migration Summary:");
		console.log(`   Created: ${created} (includes both EN and ES versions)`);
		console.log(`   Skipped: ${skipped}`);
		console.log(`   Failed: ${failed}`);
		console.log(`   Total: ${articles.length}\n`);

		if (DRY_RUN) {
			console.log("🔍 This was a dry run. Run without --dry-run to apply changes.\n");
		} else if (created > 0) {
			console.log("✅ Article migration complete!\n");
			console.log("📝 Next Steps:");
			console.log("   1. Verify articles in Sanity Studio: http://localhost:3000/studio");
			console.log("   2. Run: bun run scripts/cms-migration/04-migrate-changelog.ts\n");
			console.log("⚠️  Note: You may need to manually review and enhance Portable Text formatting");
			console.log("   The markdown conversion is simplified. For complex formatting, use Sanity Studio.\n");
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("❌ Migration failed:", error.message);
		} else {
			console.error("❌ Migration failed:", error);
		}
		process.exit(1);
	}
}

// Run migration
migrateArticles();
