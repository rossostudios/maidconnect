#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

// Load icon mapping
const iconMapping = JSON.parse(fs.readFileSync(path.join(__dirname, "icon-mapping.json"), "utf-8"));

async function replaceIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Check if file uses lucide-react
  if (!(content.includes("from 'lucide-react'") || content.includes('from "lucide-react"'))) {
    return false;
  }

  console.log(`Processing: ${filePath}`);

  // Extract the import statement
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
  const matches = [...content.matchAll(importRegex)];

  if (matches.length === 0) {
    return false;
  }

  for (const match of matches) {
    const importList = match[1];
    const fullImport = match[0];

    // Parse imported icons
    const icons = importList
      .split(",")
      .map((icon) => icon.trim())
      .filter((icon) => icon.length > 0)
      .map((icon) => {
        // Handle "Icon as AliasIcon" syntax
        const asMatch = icon.match(/^(\w+)\s+as\s+(\w+)$/);
        if (asMatch) {
          return { original: asMatch[1], alias: asMatch[2] };
        }
        return { original: icon, alias: null };
      });

    // Map to HUGEICONS
    const mappedIcons = icons
      .map((icon) => {
        const hugeIcon = iconMapping[icon.original];
        if (!hugeIcon) {
          console.warn(`  ⚠️  No mapping for: ${icon.original}`);
          return null;
        }
        return {
          lucide: icon.original,
          huge: hugeIcon,
          alias: icon.alias,
        };
      })
      .filter(Boolean);

    if (mappedIcons.length === 0) {
      continue;
    }

    // Build new import statement
    const newImports = mappedIcons
      .map((icon) => {
        if (icon.alias) {
          return `${icon.huge} as ${icon.alias}`;
        }
        return icon.huge;
      })
      .join(", ");

    const newImport = `import { ${newImports} } from "hugeicons-react"`;

    // Replace import statement
    content = content.replace(fullImport, newImport);

    // Replace icon usages in JSX (for icons without aliases)
    for (const icon of mappedIcons) {
      if (!icon.alias) {
        // Replace <IconName with <NewIconName
        const usageRegex = new RegExp(`<${icon.lucide}([\\s/>])`, "g");
        content = content.replace(usageRegex, `<${icon.huge}$1`);
      }
    }

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("  ✓ Updated successfully");
    return true;
  }

  return false;
}

async function main() {
  console.log("🔍 Finding files with lucide-react imports...\n");

  // Find all TypeScript/TSX files
  const files = await glob("src/**/*.{ts,tsx}", {
    ignore: ["node_modules/**", ".next/**"],
    absolute: true,
  });

  console.log(`Found ${files.length} total files\n`);

  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    try {
      const wasModified = await replaceIconsInFile(file);
      if (wasModified) {
        processedCount++;
        modifiedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log("\n✨ Done!");
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Modified:  ${modifiedCount} files`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
