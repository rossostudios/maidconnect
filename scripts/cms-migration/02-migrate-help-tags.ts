#!/usr/bin/env bun

/**
 * CMS Migration - Step 2: Migrate Help Tags
 *
 * Migrates help article tags from Supabase to Sanity.
 * Creates 9 help tags in Sanity with bilingual names and descriptions.
 *
 * Usage:
 *   bun run scripts/cms-migration/02-migrate-help-tags.ts
 *   bun run scripts/cms-migration/02-migrate-help-tags.ts --dry-run
 */

import { createClient as createSanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

console.log("🏷️  CMS Migration - Step 2: Help Tags");
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

interface HelpTag {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
  description_en: string;
  description_es: string;
  created_at: string;
}

async function migrateTags() {
  console.log("📥 Fetching help tags from Supabase...\n");

  try {
    // Fetch tags from Supabase
    const { data: tags, error } = await supabase
      .from("help_article_tags")
      .select("*")
      .order("slug");

    if (error) {
      if (error.message.includes("does not exist")) {
        console.log("⚠️  Table 'help_article_tags' not found");
        console.log("   Tags may already be migrated or table was never created.\n");
        console.log("💡 Manual Step: Create tags in Sanity Studio:");
        console.log("   1. Go to http://localhost:3000/studio");
        console.log("   2. Navigate to 'Help Tags'");
        console.log("   3. Create the following 9 tags:\n");
        printDefaultTags();
        return;
      }
      throw error;
    }

    if (!tags || tags.length === 0) {
      console.log("⚠️  No tags found in Supabase\n");
      console.log("💡 Manual Step: Create tags in Sanity Studio (see README.md)\n");
      return;
    }

    console.log(`✅ Found ${tags.length} tags in Supabase\n`);

    // Check existing tags in Sanity
    const existingTags = await sanityClient.fetch(`*[_type == "helpTag"] { _id, slug }`);

    console.log(`📊 Found ${existingTags.length} existing tags in Sanity\n`);

    // Migrate each tag
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const tag of tags as HelpTag[]) {
      const exists = existingTags.find(
        (t: { slug: { current: string } }) => t.slug.current === tag.slug
      );

      if (exists) {
        console.log(`⏭️  Skipping "${tag.name_en}" (already exists in Sanity)`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`🔍 Would create tag: "${tag.name_en}" (${tag.slug})`);
        created++;
        continue;
      }

      try {
        const sanityTag = {
          _type: "helpTag",
          slug: { _type: "slug", current: tag.slug },
          nameEn: tag.name_en,
          nameEs: tag.name_es,
          color: tag.color,
          descriptionEn: tag.description_en,
          descriptionEs: tag.description_es,
          language: "en", // Default language
        };

        await sanityClient.create(sanityTag);
        console.log(`✅ Created tag: "${tag.name_en}" (${tag.slug})`);
        created++;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`❌ Failed to create tag "${tag.name_en}":`, error.message);
        } else {
          console.error(`❌ Failed to create tag "${tag.name_en}":`, error);
        }
        failed++;
      }
    }

    // Summary
    console.log("\n📊 Migration Summary:");
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${tags.length}\n`);

    if (DRY_RUN) {
      console.log("🔍 This was a dry run. Run without --dry-run to apply changes.\n");
    } else if (created > 0) {
      console.log("✅ Tag migration complete!\n");
      console.log("📝 Next Steps:");
      console.log("   1. Verify tags in Sanity Studio: http://localhost:3000/studio");
      console.log("   2. Run: bun run scripts/cms-migration/03-migrate-help-articles.ts\n");
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

function printDefaultTags() {
  const defaultTags = [
    {
      slug: "getting-started",
      nameEn: "Getting Started",
      nameEs: "Primeros Pasos",
      color: "#3B82F6",
    },
    { slug: "payment", nameEn: "Payment", nameEs: "Pago", color: "#10B981" },
    {
      slug: "troubleshooting",
      nameEn: "Troubleshooting",
      nameEs: "Solución de Problemas",
      color: "#EF4444",
    },
    { slug: "mobile", nameEn: "Mobile App", nameEs: "App Móvil", color: "#8B5CF6" },
    { slug: "verification", nameEn: "Verification", nameEs: "Verificación", color: "#F59E0B" },
    { slug: "booking", nameEn: "Booking", nameEs: "Reservas", color: "#EC4899" },
    {
      slug: "professional",
      nameEn: "For Professionals",
      nameEs: "Para Profesionales",
      color: "#14B8A6",
    },
    { slug: "customer", nameEn: "For Customers", nameEs: "Para Clientes", color: "#6366F1" },
    { slug: "account", nameEn: "Account", nameEs: "Cuenta", color: "#64748B" },
  ];

  console.log("   | Slug | Name (EN) | Name (ES) | Color |");
  console.log("   |------|-----------|-----------|-------|");
  for (const tag of defaultTags) {
    console.log(`   | \`${tag.slug}\` | ${tag.nameEn} | ${tag.nameEs} | \`${tag.color}\` |`);
  }
  console.log("");
}

// Run migration
migrateTags();
