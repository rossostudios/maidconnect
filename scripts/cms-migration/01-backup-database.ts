#!/usr/bin/env bun

/**
 * CMS Migration - Step 1: Backup Database
 *
 * Creates a full backup of the Supabase database before migration.
 * CRITICAL: Run this before any migration steps!
 *
 * Usage:
 *   bun run scripts/cms-migration/01-backup-database.ts
 */

import { createClient } from "@supabase/supabase-js";
import { exec } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const BACKUP_DIR = "./backups";
const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const backupFile = `${BACKUP_DIR}/cms_backup_${timestamp}.sql`;

// Ensure backup directory exists
if (!existsSync(BACKUP_DIR)) {
	mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log("🔒 CMS Migration - Step 1: Database Backup");
console.log("==========================================\n");

// Check if backup already exists
if (existsSync(backupFile)) {
	console.log(`⚠️  Backup already exists: ${backupFile}`);
	console.log("   Skipping backup to avoid overwriting.\n");
	process.exit(0);
}

async function backupDatabase() {
	console.log("📦 Creating database backup...\n");

	try {
		// Backup using pg_dump (works with local Supabase)
		const { stdout, stderr } = await execAsync(
			`pg_dump -h localhost -p 54322 -U postgres -d postgres > ${backupFile}`,
			{
				env: { ...process.env, PGPASSWORD: "postgres" },
			},
		);

		if (stderr && !stderr.includes("WARNING")) {
			console.error("❌ Backup failed:", stderr);
			process.exit(1);
		}

		console.log(`✅ Backup created: ${backupFile}\n`);
		console.log("📊 Backup Statistics:");
		const { stdout: stats } = await execAsync(`wc -l ${backupFile}`);
		console.log(`   Lines: ${stats.trim().split(" ")[0]}`);

		const { stdout: size } = await execAsync(`du -h ${backupFile}`);
		console.log(`   Size: ${size.trim().split("\t")[0]}`);

		console.log("\n✅ Backup complete!");
		console.log("\n📝 Next Steps:");
		console.log("   1. Verify backup exists and has content");
		console.log("   2. Run: bun run scripts/cms-migration/02-migrate-help-tags.ts\n");
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("❌ Backup failed:", error.message);
		} else {
			console.error("❌ Backup failed:", error);
		}
		console.log("\n💡 Troubleshooting:");
		console.log("   - Ensure Docker Desktop is running");
		console.log("   - Run: supabase start");
		console.log("   - Check database is accessible: psql -h localhost -p 54322 -U postgres\n");
		process.exit(1);
	}
}

// Verify Supabase connection first
async function verifyConnection() {
	console.log("🔍 Verifying database connection...\n");

	try {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
		const supabaseKey =
			process.env.SUPABASE_SERVICE_ROLE_KEY ||
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

		const supabase = createClient(supabaseUrl, supabaseKey);

		// Test connection by querying help article tags
		const { data, error } = await supabase.from("help_article_tags").select("count");

		if (error) {
			if (error.message.includes("does not exist")) {
				console.log("⚠️  Table 'help_article_tags' not found");
				console.log("   This is OK if you've already migrated tags.\n");
			} else {
				throw error;
			}
		} else {
			console.log(`✅ Connected! Found ${data?.length || 0} help article tags\n`);
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("❌ Connection failed:", error.message);
		} else {
			console.error("❌ Connection failed:", error);
		}
		console.log("\n💡 Ensure Supabase is running:");
		console.log("   supabase start\n");
		process.exit(1);
	}
}

// Run backup
verifyConnection().then(backupDatabase);
