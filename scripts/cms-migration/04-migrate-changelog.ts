#!/usr/bin/env bun

/**
 * CMS Migration - Step 4: Migrate Changelog
 *
 * Migrates changelog entries from Supabase to Sanity.
 * Converts markdown content to Portable Text and handles bilingual content.
 *
 * Usage:
 *   bun run scripts/cms-migration/04-migrate-changelog.ts
 *   bun run scripts/cms-migration/04-migrate-changelog.ts --dry-run
 */

import { createClient as createSanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

console.log("📋 CMS Migration - Step 4: Changelog");
console.log("=====================================\n");

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

interface ChangelogEntry {
  id: string;
  slug: string;
  version: string;
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  type: "feature" | "improvement" | "fix" | "breaking";
  published: boolean;
  published_at: string;
  created_at: string;
}

/**
 * Convert markdown to Portable Text
 * This is a simplified converter - for production, use @sanity/block-tools
 */
function markdownToPortableText(markdown: string) {
  // Split into paragraphs
  const paragraphs = markdown.split("\n\n").filter((p) => p.trim());

  return paragraphs.flatMap((paragraph) => {
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

    // Check for bullet points
    if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
      const items = paragraph.split("\n").filter((line) => line.trim());
      return items.map((item) => ({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        listItem: "bullet",
        children: [
          {
            _type: "span",
            _key: crypto.randomUUID(),
            text: item.replace(/^[-*]\s/, ""),
            marks: [],
          },
        ],
      }));
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

async function migrateChangelog() {
  console.log("📥 Fetching changelog entries from Supabase...\n");

  try {
    // Fetch changelog from Supabase
    const { data: entries, error } = await supabase
      .from("changelog_entries")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      if (error.message.includes("does not exist")) {
        console.log("⚠️  Table 'changelog_entries' not found");
        console.log("   Changelog may already be migrated or table was never created.\n");
        console.log("💡 Manual Step: Create changelog in Sanity Studio:");
        console.log("   1. Go to http://localhost:3000/studio");
        console.log("   2. Navigate to 'Changelog'");
        console.log("   3. Create changelog entries manually\n");
        return;
      }
      throw error;
    }

    if (!entries || entries.length === 0) {
      console.log("⚠️  No changelog entries found in Supabase\n");
      console.log("💡 Manual Step: Create changelog in Sanity Studio\n");
      return;
    }

    console.log(`✅ Found ${entries.length} changelog entries in Supabase\n`);

    // Check existing entries in Sanity
    const existingEntries = await sanityClient.fetch(
      `*[_type == "changelog"] { _id, "slug": slug.current }`
    );

    console.log(`📊 Found ${existingEntries.length} existing changelog entries in Sanity\n`);

    // Migrate each entry
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const entry of entries as ChangelogEntry[]) {
      const exists = existingEntries.find((e: { slug: string }) => e.slug === entry.slug);

      if (exists) {
        console.log(`⏭️  Skipping "${entry.title_en}" (already exists in Sanity)`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`🔍 Would create changelog: "${entry.title_en}" (v${entry.version})`);
        created++;
        continue;
      }

      try {
        // Convert markdown to Portable Text
        const contentEn = markdownToPortableText(entry.content_en);
        const contentEs = markdownToPortableText(entry.content_es);

        // Create English version (default)
        const sanityEntryEn = {
          _type: "changelog",
          slug: { _type: "slug", current: entry.slug },
          title: entry.title_en,
          content: contentEn,
          version: entry.version,
          type: entry.type,
          published: entry.published,
          publishedAt: entry.published_at,
          language: "en",
        };

        const createdEn = await sanityClient.create(sanityEntryEn);
        console.log(`✅ Created English entry: "${entry.title_en}" (v${entry.version})`);

        // Create Spanish translation
        const sanityEntryEs = {
          ...sanityEntryEn,
          _id: `${createdEn._id}__i18n_es`,
          title: entry.title_es,
          content: contentEs,
          language: "es",
        };

        await sanityClient.create(sanityEntryEs);
        console.log(`✅ Created Spanish translation: "${entry.title_es}"\n`);

        created++;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`❌ Failed to create entry "${entry.title_en}":`, error.message);
        } else {
          console.error(`❌ Failed to create entry "${entry.title_en}":`, error);
        }
        failed++;
      }
    }

    // Summary
    console.log("\n📊 Migration Summary:");
    console.log(`   Created: ${created} (includes both EN and ES versions)`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${entries.length}\n`);

    if (DRY_RUN) {
      console.log("🔍 This was a dry run. Run without --dry-run to apply changes.\n");
    } else if (created > 0) {
      console.log("✅ Changelog migration complete!\n");
      console.log("📝 Next Steps:");
      console.log("   1. Verify changelog in Sanity Studio: http://localhost:3000/studio");
      console.log("   2. Run: bun run scripts/cms-migration/05-verify-migration.ts\n");
      console.log("⚠️  Note: You may need to manually review and enhance Portable Text formatting");
      console.log(
        "   The markdown conversion is simplified. For complex formatting, use Sanity Studio.\n"
      );
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
migrateChangelog();
