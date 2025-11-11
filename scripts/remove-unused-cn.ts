#!/usr/bin/env bun
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith(".tsx") && !filePath.endsWith(".stories.tsx")) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

const componentsDir = "src/components";
const files = getAllFiles(componentsDir);

let count = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");

  // Check if file imports cn
  if (content.includes('import { cn } from "@/lib/utils";')) {
    // Check if cn is actually used
    if (!content.match(/cn\(/)) {
      // Remove the import
      const newContent = content.replace(/^import { cn } from "@\/lib\/utils";\n/gm, "");
      writeFileSync(file, newContent);
      console.log(`Removed unused cn from: ${file}`);
      count++;
    }
  }
}

console.log(`\n✅ Removed unused cn imports from ${count} files`);
