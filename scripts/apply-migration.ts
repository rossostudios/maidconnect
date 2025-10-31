import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!(supabaseUrl && supabaseServiceKey) || supabaseServiceKey === "your-service-role-key") {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file");
  console.error("Please add your service role key from Supabase dashboard → Settings → API");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationFileName: string) {
  const migrationPath = join(process.cwd(), "supabase", "migrations", migrationFileName);

  try {
    const sql = readFileSync(migrationPath, "utf-8");
    console.log(`📦 Applying migration: ${migrationFileName}`);

    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }

    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Error reading or applying migration:", error);
    process.exit(1);
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Usage: tsx scripts/apply-migration.ts <migration-filename>");
  process.exit(1);
}

applyMigration(migrationFile);
