/**
 * Combined Migration Runner
 *
 * Runs all Sanity migration scripts in sequence
 *
 * Usage: bun run scripts/migrate-all.ts
 */

console.log('🚀 Starting Sanity CMS Migration\n');
console.log('================================================\n');

// Run Help Center migration
console.log('1️⃣ Running Help Center migration...\n');
await import('./migrate-help-center');

console.log('\n================================================\n');
console.log('✅ All migrations completed!\n');
console.log('🎉 Your content is now in Sanity Studio at /studio\n');

// Make this file a module
export {};
