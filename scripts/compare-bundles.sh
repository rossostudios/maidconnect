#!/bin/bash
# Compare baseline vs PR bundle stats
# Usage: ./scripts/compare-bundles.sh [baseline.json] [current.json] [output.md]
# Exit codes: 0=success, 1=failure (hard limit), 2=warning (soft limit)

set -e

BASELINE="${1:-baseline-stats.json}"
CURRENT="${2:-bundle-stats.json}"
OUTPUT="${3:-comparison-report.md}"

if [ ! -f "$BASELINE" ]; then
  echo "Error: Baseline file not found: $BASELINE"
  exit 1
fi

if [ ! -f "$CURRENT" ]; then
  echo "Error: Current stats file not found: $CURRENT"
  exit 1
fi

# Run comparison with Node.js
node << 'SCRIPT'
const fs = require('fs');

const baselineFile = process.argv[2] || 'baseline-stats.json';
const currentFile = process.argv[3] || 'bundle-stats.json';
const outputFile = process.argv[4] || 'comparison-report.md';

// Budget limits (in bytes)
const HARD_CHUNK_LIMIT = 307200;  // 300KB per chunk
const SOFT_CHUNK_LIMIT = 256000;  // 250KB per chunk
const HARD_TOTAL_INCREASE = 10;  // 10% total increase
const SOFT_TOTAL_INCREASE = 5;   // 5% total increase

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const current = JSON.parse(fs.readFileSync(currentFile, 'utf8'));

const totalDiff = current.totalJs - baseline.totalJs;
const totalDiffPercent = baseline.totalJs > 0
  ? ((totalDiff / baseline.totalJs) * 100).toFixed(2)
  : '0.00';

let exitCode = 0;
const violations = [];
const warnings = [];

// Check total size increase
if (parseFloat(totalDiffPercent) >= HARD_TOTAL_INCREASE && totalDiff > 0) {
  violations.push(`Total JS increased by ${totalDiffPercent}% (>${HARD_TOTAL_INCREASE}% hard limit)`);
  exitCode = 1;
} else if (parseFloat(totalDiffPercent) >= SOFT_TOTAL_INCREASE && totalDiff > 0) {
  warnings.push(`Total JS increased by ${totalDiffPercent}% (>${SOFT_TOTAL_INCREASE}% soft limit)`);
  exitCode = Math.max(exitCode, 2);
}

// Check individual chunk limits
current.chunks.forEach(chunk => {
  if (chunk.size > HARD_CHUNK_LIMIT) {
    violations.push(`Chunk ${chunk.name}: ${(chunk.size/1024).toFixed(1)}KB exceeds 300KB hard limit`);
    exitCode = 1;
  } else if (chunk.size > SOFT_CHUNK_LIMIT) {
    warnings.push(`Chunk ${chunk.name}: ${(chunk.size/1024).toFixed(1)}KB exceeds 250KB soft limit`);
    exitCode = Math.max(exitCode, 2);
  }
});

// Generate markdown report
let report = '## Bundle Size Analysis\n\n';

// Status badge
if (exitCode === 0) {
  report += '### Status: PASS\n\n';
} else if (exitCode === 2) {
  report += '### Status: WARNING\n\n';
} else {
  report += '### Status: FAIL\n\n';
}

// Summary table
report += '| Metric | Baseline | Current | Diff |\n';
report += '|--------|----------|---------|------|\n';

const formatSize = (bytes) => `${(bytes/1024).toFixed(1)}KB`;
const formatDiff = (diff) => `${diff > 0 ? '+' : ''}${formatSize(diff)}`;

report += `| Total JS | ${formatSize(baseline.totalJs)} | ${formatSize(current.totalJs)} | ${formatDiff(totalDiff)} (${totalDiffPercent}%) |\n`;
report += `| Total CSS | ${formatSize(baseline.totalCss)} | ${formatSize(current.totalCss)} | ${formatDiff(current.totalCss - baseline.totalCss)} |\n`;
report += `| Chunks >100KB | ${baseline.summary.over100kb} | ${current.summary.over100kb} | ${current.summary.over100kb - baseline.summary.over100kb > 0 ? '+' : ''}${current.summary.over100kb - baseline.summary.over100kb} |\n`;
report += `| Chunks >250KB | ${baseline.summary.over250kb} | ${current.summary.over250kb} | ${current.summary.over250kb - baseline.summary.over250kb > 0 ? '+' : ''}${current.summary.over250kb - baseline.summary.over250kb} |\n\n`;

// Violations
if (violations.length > 0) {
  report += '### Violations (Must Fix)\n\n';
  violations.forEach(v => report += `- ${v}\n`);
  report += '\n';
}

// Warnings
if (warnings.length > 0) {
  report += '### Warnings\n\n';
  warnings.forEach(w => report += `- ${w}\n`);
  report += '\n';
}

// Top 10 largest chunks
report += '### Top 10 Largest Chunks\n\n';
report += '| Chunk | Size | Gzipped | Status |\n';
report += '|-------|------|---------|--------|\n';
current.chunks.slice(0, 10).forEach(c => {
  let status = 'OK';
  if (c.size > HARD_CHUNK_LIMIT) {
    status = 'FAIL';
  } else if (c.size > SOFT_CHUNK_LIMIT) {
    status = 'WARN';
  }
  report += `| ${c.name} | ${formatSize(c.size)} | ${formatSize(c.gzippedSize)} | ${status} |\n`;
});

// Write report
fs.writeFileSync(outputFile, report);

// Print to console
console.log(report);

// Exit with appropriate code
process.exit(exitCode);
SCRIPT

echo "Comparison complete. Report written to: $OUTPUT"
