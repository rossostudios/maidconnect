#!/usr/bin/env bun

/**
 * CMS Migration - Step 5: Verify Migration
 *
 * Verifies that all content was successfully migrated from Supabase to Sanity.
 * Compares record counts and checks data integrity.
 *
 * Usage:
 *   bun run scripts/cms-migration/05-verify-migration.ts
 */

import { createClient as createSanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

console.log("✅ CMS Migration - Step 5: Verification");
console.log("========================================\n");

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

interface VerificationResult {
	section: string;
	supabaseCount: number | null;
	sanityCount: number;
	status: "✅ Pass" | "⚠️  Warning" | "❌ Fail";
	message: string;
}

const results: VerificationResult[] = [];

async function verifyTags() {
	console.log("🏷️  Verifying Help Tags...");

	try {
		// Count tags in Supabase
		const { count: supabaseCount, error } = await supabase
			.from("help_article_tags")
			.select("*", { count: "exact", head: true });

		const tableExists = !error || !error.message.includes("does not exist");

		// Count tags in Sanity
		const sanityTags = await sanityClient.fetch(
			`*[_type == "helpTag" && language == "en"] | order(slug)`,
		);
		const sanityCount = sanityTags.length;

		if (!tableExists) {
			results.push({
				section: "Help Tags",
				supabaseCount: null,
				sanityCount,
				status: "⚠️  Warning",
				message: "Supabase table not found (may have been dropped)",
			});
		} else if (supabaseCount === sanityCount) {
			results.push({
				section: "Help Tags",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "✅ Pass",
				message: "All tags migrated successfully",
			});
		} else {
			results.push({
				section: "Help Tags",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "❌ Fail",
				message: `Missing ${(supabaseCount || 0) - sanityCount} tags`,
			});
		}

		console.log(`   Supabase: ${tableExists ? supabaseCount : "N/A"}`);
		console.log(`   Sanity: ${sanityCount}\n`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`   ❌ Error:`, error.message);
		}
		results.push({
			section: "Help Tags",
			supabaseCount: null,
			sanityCount: 0,
			status: "❌ Fail",
			message: "Verification failed",
		});
	}
}

async function verifyArticles() {
	console.log("📝 Verifying Help Articles...");

	try {
		// Count articles in Supabase
		const { count: supabaseCount, error } = await supabase
			.from("help_articles")
			.select("*", { count: "exact", head: true });

		const tableExists = !error || !error.message.includes("does not exist");

		// Count articles in Sanity (English only to avoid double counting)
		const sanityArticles = await sanityClient.fetch(
			`*[_type == "helpArticle" && language == "en"] | order(slug)`,
		);
		const sanityCount = sanityArticles.length;

		// Verify articles have required fields
		const invalidArticles = sanityArticles.filter(
			(a: { title?: string; content?: unknown; category?: unknown }) =>
				!a.title || !a.content || !a.category,
		);

		if (!tableExists) {
			results.push({
				section: "Help Articles",
				supabaseCount: null,
				sanityCount,
				status: "⚠️  Warning",
				message: "Supabase table not found (may have been dropped)",
			});
		} else if (supabaseCount === sanityCount && invalidArticles.length === 0) {
			results.push({
				section: "Help Articles",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "✅ Pass",
				message: "All articles migrated successfully",
			});
		} else if (invalidArticles.length > 0) {
			results.push({
				section: "Help Articles",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "⚠️  Warning",
				message: `${invalidArticles.length} articles missing required fields`,
			});
		} else {
			results.push({
				section: "Help Articles",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "❌ Fail",
				message: `Missing ${(supabaseCount || 0) - sanityCount} articles`,
			});
		}

		console.log(`   Supabase: ${tableExists ? supabaseCount : "N/A"}`);
		console.log(`   Sanity: ${sanityCount}`);
		if (invalidArticles.length > 0) {
			console.log(`   ⚠️  ${invalidArticles.length} articles need review\n`);
		} else {
			console.log("");
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`   ❌ Error:`, error.message);
		}
		results.push({
			section: "Help Articles",
			supabaseCount: null,
			sanityCount: 0,
			status: "❌ Fail",
			message: "Verification failed",
		});
	}
}

async function verifyChangelog() {
	console.log("📋 Verifying Changelog...");

	try {
		// Count changelog in Supabase
		const { count: supabaseCount, error } = await supabase
			.from("changelog_entries")
			.select("*", { count: "exact", head: true });

		const tableExists = !error || !error.message.includes("does not exist");

		// Count changelog in Sanity (English only to avoid double counting)
		const sanityChangelog = await sanityClient.fetch(
			`*[_type == "changelog" && language == "en"] | order(publishedAt desc)`,
		);
		const sanityCount = sanityChangelog.length;

		// Verify entries have required fields
		const invalidEntries = sanityChangelog.filter(
			(e: { title?: string; content?: unknown; version?: string }) =>
				!e.title || !e.content || !e.version,
		);

		if (!tableExists) {
			results.push({
				section: "Changelog",
				supabaseCount: null,
				sanityCount,
				status: "⚠️  Warning",
				message: "Supabase table not found (may have been dropped)",
			});
		} else if (supabaseCount === sanityCount && invalidEntries.length === 0) {
			results.push({
				section: "Changelog",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "✅ Pass",
				message: "All changelog entries migrated successfully",
			});
		} else if (invalidEntries.length > 0) {
			results.push({
				section: "Changelog",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "⚠️  Warning",
				message: `${invalidEntries.length} entries missing required fields`,
			});
		} else {
			results.push({
				section: "Changelog",
				supabaseCount: supabaseCount || 0,
				sanityCount,
				status: "❌ Fail",
				message: `Missing ${(supabaseCount || 0) - sanityCount} entries`,
			});
		}

		console.log(`   Supabase: ${tableExists ? supabaseCount : "N/A"}`);
		console.log(`   Sanity: ${sanityCount}`);
		if (invalidEntries.length > 0) {
			console.log(`   ⚠️  ${invalidEntries.length} entries need review\n`);
		} else {
			console.log("");
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`   ❌ Error:`, error.message);
		}
		results.push({
			section: "Changelog",
			supabaseCount: null,
			sanityCount: 0,
			status: "❌ Fail",
			message: "Verification failed",
		});
	}
}

async function verifyDataIntegrity() {
	console.log("🔍 Verifying Data Integrity...");

	try {
		// Check that all articles have valid category references
		const articlesWithoutCategory = await sanityClient.fetch(
			`*[_type == "helpArticle" && !defined(category)]`,
		);

		// Check that all articles have content
		const articlesWithoutContent = await sanityClient.fetch(
			`*[_type == "helpArticle" && !defined(content)]`,
		);

		// Check changelog entries have versions
		const entriesWithoutVersion = await sanityClient.fetch(
			`*[_type == "changelog" && !defined(version)]`,
		);

		const issues: string[] = [];

		if (articlesWithoutCategory.length > 0) {
			issues.push(`${articlesWithoutCategory.length} articles missing category`);
		}

		if (articlesWithoutContent.length > 0) {
			issues.push(`${articlesWithoutContent.length} articles missing content`);
		}

		if (entriesWithoutVersion.length > 0) {
			issues.push(`${entriesWithoutVersion.length} changelog entries missing version`);
		}

		if (issues.length === 0) {
			results.push({
				section: "Data Integrity",
				supabaseCount: null,
				sanityCount: 0,
				status: "✅ Pass",
				message: "All data integrity checks passed",
			});
			console.log(`   ✅ All data integrity checks passed\n`);
		} else {
			results.push({
				section: "Data Integrity",
				supabaseCount: null,
				sanityCount: 0,
				status: "⚠️  Warning",
				message: issues.join(", "),
			});
			console.log(`   ⚠️  Issues found:`);
			for (const issue of issues) {
				console.log(`      - ${issue}`);
			}
			console.log("");
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`   ❌ Error:`, error.message);
		}
		results.push({
			section: "Data Integrity",
			supabaseCount: null,
			sanityCount: 0,
			status: "❌ Fail",
			message: "Verification failed",
		});
	}
}

function printSummary() {
	console.log("📊 Verification Summary");
	console.log("=======================\n");

	// Print table
	console.log("| Section           | Supabase | Sanity | Status       | Message                          |");
	console.log("|-------------------|----------|--------|--------------|----------------------------------|");

	for (const result of results) {
		const supabase = result.supabaseCount !== null ? result.supabaseCount.toString().padEnd(8) : "N/A     ";
		const sanity = result.sanityCount.toString().padEnd(6);
		const status = result.status.padEnd(12);
		const message = result.message.padEnd(32);

		console.log(`| ${result.section.padEnd(17)} | ${supabase} | ${sanity} | ${status} | ${message} |`);
	}

	console.log("\n");

	// Overall status
	const failCount = results.filter((r) => r.status === "❌ Fail").length;
	const warnCount = results.filter((r) => r.status === "⚠️  Warning").length;
	const passCount = results.filter((r) => r.status === "✅ Pass").length;

	if (failCount > 0) {
		console.log("❌ MIGRATION INCOMPLETE");
		console.log(`   ${failCount} critical issue(s) found`);
		console.log("   Review failed sections and re-run migrations if needed.\n");
	} else if (warnCount > 0) {
		console.log("⚠️  MIGRATION COMPLETE WITH WARNINGS");
		console.log(`   ${warnCount} warning(s) found`);
		console.log("   Review warnings and fix any data integrity issues.\n");
	} else {
		console.log("✅ MIGRATION SUCCESSFUL");
		console.log(`   All ${passCount} verification checks passed!`);
		console.log("   Your content is ready in Sanity.\n");
	}

	console.log("📝 Next Steps:");
	if (failCount === 0 && warnCount === 0) {
		console.log("   1. Review content in Sanity Studio: http://localhost:3000/studio");
		console.log("   2. Update components to use Sanity data (see docs/cms-migration-guide.md)");
		console.log("   3. Test help center and changelog pages");
		console.log("   4. Run SQL cleanup: bun run scripts/cms-migration/06-cleanup-database.ts\n");
	} else {
		console.log("   1. Review failed/warned sections above");
		console.log("   2. Re-run failed migrations if needed");
		console.log("   3. Fix data integrity issues in Sanity Studio");
		console.log("   4. Run verification again to confirm fixes\n");
	}
}

async function runVerification() {
	try {
		await verifyTags();
		await verifyArticles();
		await verifyChangelog();
		await verifyDataIntegrity();
		printSummary();
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("\n❌ Verification failed:", error.message);
		} else {
			console.error("\n❌ Verification failed:", error);
		}
		process.exit(1);
	}
}

// Run verification
runVerification();
