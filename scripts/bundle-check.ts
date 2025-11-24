#!/usr/bin/env bun
/**
 * Local Bundle Check Script
 *
 * Run this before pushing to catch bundle size issues early.
 * Usage: bun run bundle:check
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Hard limit exceeded (must fix)
 *   2 = Soft limit exceeded (warning)
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Configuration (matches bundle.config.json)
const CONFIG = {
  limits: {
    hardChunkLimit: 307200, // 300KB per chunk
    softChunkLimit: 256000, // 250KB per chunk
    hardTotalIncrease: 10, // 10% total increase
    softTotalIncrease: 5, // 5% total increase
  },
  lighthouse: {
    lcp: 2500,
    fcp: 1800,
    cls: 0.1,
    tbt: 200,
  },
};

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
}

interface BundleStats {
  totalJs: number;
  totalCss: number;
  chunks: ChunkInfo[];
  summary: {
    totalChunks: number;
    over100kb: number;
    over250kb: number;
    over300kb: number;
    largestChunk: ChunkInfo | null;
  };
}

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function walkDir(
  dir: string,
  extension: string,
  chunks: ChunkInfo[]
): number {
  if (!existsSync(dir)) return 0;

  let total = 0;
  const files = readdirSync(dir, { recursive: true });

  for (const file of files) {
    const filePath = join(dir, String(file));
    try {
      const stat = statSync(filePath);
      if (stat.isFile() && filePath.endsWith(extension)) {
        const content = readFileSync(filePath);
        const gzipped = gzipSync(content);
        total += stat.size;

        chunks.push({
          name: String(file),
          size: stat.size,
          gzippedSize: gzipped.length,
        });
      }
    } catch {
      // Skip files we can't read
    }
  }

  return total;
}

function analyzeBundle(): BundleStats {
  const buildDir = ".next";

  if (!existsSync(buildDir)) {
    console.error(
      `${colors.red}Error: .next directory not found. Run 'bun run build' first.${colors.reset}`
    );
    process.exit(1);
  }

  const chunks: ChunkInfo[] = [];
  const totalJs = walkDir(join(buildDir, "static/chunks"), ".js", chunks);
  const totalCss = walkDir(join(buildDir, "static/css"), ".css", []);

  chunks.sort((a, b) => b.size - a.size);

  return {
    totalJs,
    totalCss,
    chunks,
    summary: {
      totalChunks: chunks.length,
      over100kb: chunks.filter((c) => c.size > 100000).length,
      over250kb: chunks.filter((c) => c.size > 250000).length,
      over300kb: chunks.filter((c) => c.size > 307200).length,
      largestChunk: chunks[0] || null,
    },
  };
}

function printHeader(text: string): void {
  console.log(`\n${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log("─".repeat(50));
}

function printStatus(
  label: string,
  value: string,
  status: "pass" | "warn" | "fail"
): void {
  const statusIcon =
    status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗";
  const statusColor =
    status === "pass"
      ? colors.green
      : status === "warn"
        ? colors.yellow
        : colors.red;
  console.log(
    `${statusColor}${statusIcon}${colors.reset} ${label}: ${colors.bold}${value}${colors.reset}`
  );
}

function main(): void {
  console.log(
    `\n${colors.bold}📦 Bundle Size Analysis${colors.reset}`
  );

  const stats = analyzeBundle();
  const violations: string[] = [];
  const warnings: string[] = [];

  // Print summary
  printHeader("Summary");
  console.log(`Total JS:     ${formatSize(stats.totalJs)}`);
  console.log(`Total CSS:    ${formatSize(stats.totalCss)}`);
  console.log(`Total Chunks: ${stats.summary.totalChunks}`);

  // Check chunk limits
  printHeader("Chunk Size Checks");

  for (const chunk of stats.chunks) {
    if (chunk.size > CONFIG.limits.hardChunkLimit) {
      violations.push(
        `${chunk.name}: ${formatSize(chunk.size)} exceeds 300KB hard limit`
      );
      printStatus(
        chunk.name,
        `${formatSize(chunk.size)} (gzip: ${formatSize(chunk.gzippedSize)})`,
        "fail"
      );
    } else if (chunk.size > CONFIG.limits.softChunkLimit) {
      warnings.push(
        `${chunk.name}: ${formatSize(chunk.size)} exceeds 250KB soft limit`
      );
      printStatus(
        chunk.name,
        `${formatSize(chunk.size)} (gzip: ${formatSize(chunk.gzippedSize)})`,
        "warn"
      );
    }
  }

  if (violations.length === 0 && warnings.length === 0) {
    printStatus("All chunks", "within budget", "pass");
  }

  // Top 10 largest chunks
  printHeader("Top 10 Largest Chunks");
  console.log(
    `${"Chunk".padEnd(40)} ${"Size".padStart(10)} ${"Gzipped".padStart(10)}`
  );
  console.log("─".repeat(62));

  for (const chunk of stats.chunks.slice(0, 10)) {
    const name =
      chunk.name.length > 38
        ? `...${chunk.name.slice(-35)}`
        : chunk.name;
    console.log(
      `${name.padEnd(40)} ${formatSize(chunk.size).padStart(10)} ${formatSize(chunk.gzippedSize).padStart(10)}`
    );
  }

  // Chunk distribution
  printHeader("Chunk Distribution");
  console.log(`Chunks > 100KB: ${stats.summary.over100kb}`);
  console.log(`Chunks > 250KB: ${stats.summary.over250kb}`);
  console.log(`Chunks > 300KB: ${stats.summary.over300kb}`);

  // Final status
  printHeader("Status");

  if (violations.length > 0) {
    console.log(
      `\n${colors.red}${colors.bold}❌ FAIL: ${violations.length} violation(s) found${colors.reset}`
    );
    for (const v of violations) {
      console.log(`  ${colors.red}• ${v}${colors.reset}`);
    }
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(
      `\n${colors.yellow}${colors.bold}⚠️  WARNING: ${warnings.length} warning(s) found${colors.reset}`
    );
    for (const w of warnings) {
      console.log(`  ${colors.yellow}• ${w}${colors.reset}`);
    }
    process.exit(2);
  }

  console.log(
    `\n${colors.green}${colors.bold}✅ PASS: All checks passed${colors.reset}`
  );
  process.exit(0);
}

main();
