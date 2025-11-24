#!/bin/bash
# Generate JSON bundle statistics from .next build output
# Usage: ./scripts/bundle-stats.sh [output-file]
# Exit codes: 0=success, 1=error

set -e

OUTPUT_FILE="${1:-bundle-stats.json}"
BUILD_DIR=".next"

if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: .next directory not found. Run 'bun run build' first."
  exit 1
fi

# Generate JSON output with chunk details using Node.js
node << 'SCRIPT'
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outputFile = process.argv[2] || 'bundle-stats.json';
const staticDir = '.next/static/chunks';
const cssDir = '.next/static/css';

// Collect JS chunks
const chunks = [];
let totalJs = 0;
let totalCss = 0;

function walkDir(dir, extension, collection, sizeAccumulator) {
  if (!fs.existsSync(dir)) return 0;

  let total = 0;
  const files = fs.readdirSync(dir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(dir, String(file));
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && filePath.endsWith(extension)) {
        const content = fs.readFileSync(filePath);
        const gzipped = zlib.gzipSync(content);
        total += stat.size;

        if (collection) {
          collection.push({
            name: String(file),
            size: stat.size,
            gzippedSize: gzipped.length
          });
        }
      }
    } catch (e) {
      // Skip files we can't read
    }
  }
  return total;
}

// Collect JS chunks
totalJs = walkDir(staticDir, '.js', chunks, null);

// Collect CSS (just for total, no individual tracking)
totalCss = walkDir(cssDir, '.css', null, null);

// Sort chunks by size descending
chunks.sort((a, b) => b.size - a.size);

const output = {
  timestamp: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  branch: process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'local',
  totalJs: totalJs,
  totalCss: totalCss,
  chunks: chunks.slice(0, 50), // Top 50 chunks
  summary: {
    totalChunks: chunks.length,
    largestChunk: chunks[0] || null,
    over100kb: chunks.filter(c => c.size > 100000).length,
    over250kb: chunks.filter(c => c.size > 250000).length,
    over300kb: chunks.filter(c => c.size > 307200).length
  }
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`Bundle stats written to ${outputFile}`);
console.log(`Total JS: ${(totalJs / 1024).toFixed(1)}KB`);
console.log(`Total CSS: ${(totalCss / 1024).toFixed(1)}KB`);
console.log(`Chunks: ${chunks.length}`);
console.log(`Chunks >250KB: ${output.summary.over250kb}`);
console.log(`Chunks >300KB: ${output.summary.over300kb}`);
SCRIPT

echo "Bundle stats generated: $OUTPUT_FILE"
