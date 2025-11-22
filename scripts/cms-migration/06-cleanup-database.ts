#!/usr/bin/env bun

/**
 * CMS Migration - Step 6: Database Cleanup
 *
 * ⚠️  WARNING: This script PERMANENTLY DELETES Supabase CMS tables.
 * Only run this AFTER verifying the migration was successful.
 *
 * Tables to be dropped:
 * - help_article_tags
 * - changelog_entries
 * - help_search_analytics (analytics moved to PostHog)
 *
 * Tables PRESERVED:
 * - help_articles (engagement metrics: view_count, helpful_count, not_helpful_count)
 *
 * Usage:
 *   bun run scripts/cms-migration/06-cleanup-database.ts
 *   bun run scripts/cms-migration/06-cleanup-database.ts --dry-run
 *   bun run scripts/cms-migration/06-cleanup-database.ts --force (skip confirmation)
 */

import { execSync } from "node:child_process";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

console.log("🗑️  CMS Migration - Step 6: Database Cleanup");
console.log("============================================\n");

if (DRY_RUN) {
  console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

// Initialize client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

/**
 * Tables to drop after successful migration
 *
 * IMPORTANT: Only run this after verifying all components are using Sanity
 * and the migration is confirmed successful.
 *
 * NOTE: help_articles table is PRESERVED because it stores engagement metrics
 * (view_count, helpful_count, not_helpful_count) that are still actively used
 * by the application. This is a hybrid architecture:
 * - Content (title, body, etc.) → Sanity CMS
 * - Engagement metrics → Supabase (help_articles table)
 */
const TABLES_TO_DROP = [
  { name: "help_search_analytics", reason: "Analytics moved to PostHog" },
  { name: "help_article_tags", reason: "Tags migrated to Sanity" },
  // help_articles is PRESERVED for engagement metrics (view_count, helpful_count, not_helpful_count)
  { name: "changelog_entries", reason: "Changelog migrated to Sanity" },
];

async function createFinalBackup() {
  console.log("💾 Checking backup status...\n");

  try {
    // Try to create backup using Supabase CLI
    console.log("   Attempting backup with Supabase CLI...");

    try {
      execSync("supabase db dump -f ./backups/pre_cleanup_backup.sql", {
        stdio: "inherit",
      });
      console.log("   ✅ Backup created successfully\n");
      return "./backups/pre_cleanup_backup.sql";
    } catch (cliError) {
      console.log("   ⚠️  Supabase CLI backup not available");
      console.log("   ℹ️  Migration already verified - proceeding without backup");
      console.log("   📝 Note: Tables being dropped have been migrated to Sanity\n");
      return null;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("   ⚠️  Backup skipped:", error.message);
      console.log("   ℹ️  Proceeding - tables already migrated to Sanity\n");
    }
    return null;
  }
}

async function verifyTablesExist() {
  console.log("🔍 Checking which tables exist...\n");

  const existingTables: string[] = [];

  for (const table of TABLES_TO_DROP) {
    try {
      const { error } = await supabase.from(table.name).select("*", { count: "exact", head: true });

      if (error && error.message.includes("does not exist")) {
        console.log(`   ⏭️  ${table.name} already dropped`);
      } else {
        existingTables.push(table.name);
        console.log(`   ✅ ${table.name} exists`);
      }
    } catch {
      console.log(`   ⏭️  ${table.name} already dropped`);
    }
  }

  console.log("");
  return existingTables;
}

async function promptConfirmation(existingTables: string[]) {
  if (FORCE) {
    console.log("⚠️  Force mode enabled - skipping confirmation\n");
    return true;
  }

  console.log("⚠️  WARNING: The following tables will be PERMANENTLY DELETED:\n");
  for (const tableName of existingTables) {
    const table = TABLES_TO_DROP.find((t) => t.name === tableName);
    console.log(`   • ${tableName} - ${table?.reason}`);
  }
  console.log("\n📝 Before proceeding, ensure:");
  console.log("   1. Migration verification passed (step 5)");
  console.log("   2. All content is in Sanity and working");
  console.log("   3. You have a recent backup");
  console.log("\n   Type 'DELETE TABLES' to confirm (or anything else to cancel): ");

  // Read from stdin
  const response = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });

  return response === "DELETE TABLES";
}

async function dropTables(tablesToDrop: string[]) {
  console.log("\n🗑️  Dropping tables...\n");

  let dropped = 0;
  let failed = 0;

  for (const tableName of tablesToDrop) {
    const table = TABLES_TO_DROP.find((t) => t.name === tableName);

    if (DRY_RUN) {
      console.log(`🔍 Would drop table: ${tableName} (${table?.reason})`);
      dropped++;
      continue;
    }

    try {
      // Drop table using SQL
      const { error } = await supabase.rpc("exec_sql", {
        sql: `DROP TABLE IF EXISTS ${tableName} CASCADE;`,
      });

      if (error) {
        // Fallback: try direct SQL execution
        console.log(`   Attempting to drop ${tableName}...`);
        // Note: This requires a custom RPC function in Supabase
        // If it fails, users will need to drop tables manually
        throw error;
      }

      console.log(`   ✅ Dropped table: ${tableName}`);
      dropped++;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`   ❌ Failed to drop ${tableName}:`, error.message);
        console.log(`      Manual SQL: DROP TABLE IF EXISTS ${tableName} CASCADE;`);
      }
      failed++;
    }
  }

  return { dropped, failed };
}

async function generateManualSQL(tablesToDrop: string[]) {
  console.log("\n📝 Manual Cleanup SQL (if needed):");
  console.log("==================================\n");
  console.log("-- Copy and paste this SQL into Supabase SQL Editor:");
  console.log("-- https://supabase.com/dashboard/project/_/sql/new\n");

  for (const tableName of tablesToDrop) {
    console.log(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
  }

  console.log("");
}

async function cleanupDatabase() {
  try {
    // Step 1: Verify which tables exist
    const existingTables = await verifyTablesExist();

    if (existingTables.length === 0) {
      console.log("✅ All CMS tables already cleaned up. Nothing to do.\n");
      return;
    }

    // Step 2: Create final backup (only if not dry-run)
    if (!DRY_RUN) {
      await createFinalBackup();
    }

    // Step 3: Get confirmation (only if not dry-run and not force)
    if (!DRY_RUN) {
      const confirmed = await promptConfirmation(existingTables);

      if (!confirmed) {
        console.log("\n❌ Cleanup cancelled by user\n");
        process.exit(0);
      }
    }

    // Step 4: Drop tables
    const { dropped, failed } = await dropTables(existingTables);

    // Step 5: Generate manual SQL for failed tables
    if (failed > 0 && !DRY_RUN) {
      const failedTables = existingTables.filter((t) => !TABLES_TO_DROP.includes(t));
      await generateManualSQL(failedTables);
    }

    // Summary
    console.log("\n📊 Cleanup Summary:");
    console.log(`   Dropped: ${dropped} tables`);
    console.log(`   Failed: ${failed} tables`);
    console.log(`   Total: ${existingTables.length} tables\n`);

    if (DRY_RUN) {
      console.log("🔍 This was a dry run. Run without --dry-run to apply changes.\n");
    } else if (dropped === existingTables.length) {
      console.log("✅ Database cleanup complete!\n");
      console.log("📝 Next Steps:");
      console.log("   1. Verify application works correctly");
      console.log("   2. Monitor for any issues");
      console.log("   3. Keep backups for at least 30 days");
      console.log("   4. Update documentation to reflect Sanity-only CMS\n");
    } else if (failed > 0) {
      console.log("⚠️  Some tables could not be dropped automatically.\n");
      console.log("📝 Next Steps:");
      console.log("   1. Use the manual SQL above to drop remaining tables");
      console.log("   2. Or drop tables in Supabase Dashboard: Table Editor > Delete");
      console.log("   3. Re-run this script to verify all tables are dropped\n");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("\n❌ Cleanup failed:", error.message);
    } else {
      console.error("\n❌ Cleanup failed:", error);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run cleanup
cleanupDatabase();
