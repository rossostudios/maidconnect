#!/bin/bash

###############################################################################
# Casaora Color Migration Script
#
# Replaces hardcoded colors (slate/stone) with new neutral/orange palette
# across the entire src/ directory.
#
# Usage: bash scripts/replace-colors.sh
#
# IMPORTANT: Review changes carefully before committing!
###############################################################################

set -e  # Exit on error

echo "🎨 Starting Casaora Color Migration..."
echo "================================================"
echo ""

# Count total files to be processed
TOTAL_FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) | wc -l | tr -d ' ')
echo "📁 Found $TOTAL_FILES files to process"
echo ""

# Create backup
BACKUP_DIR="backups/color-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "💾 Creating backup in $BACKUP_DIR..."
cp -R src "$BACKUP_DIR/"
echo "✅ Backup created successfully"
echo ""

# Phase 1: Replace hardcoded hex colors → Tailwind classes
echo "🔄 Phase 1: Replacing hardcoded hex colors with Tailwind classes..."
echo "---------------------------------------------------"

# Slate colors → Neutral
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -print0 | while IFS= read -r -d '' file; do
  # Background colors
  sed -i '' \
    -e 's/#f8fafc/neutral-50/gi' \
    -e 's/#f1f5f9/neutral-100/gi' \
    -e 's/#e2e8f0/neutral-200/gi' \
    -e 's/#cbd5e1/neutral-300/gi' \
    -e 's/#94a3b8/neutral-400/gi' \
    -e 's/#64748b/neutral-500/gi' \
    -e 's/#475569/neutral-600/gi' \
    -e 's/#334155/neutral-700/gi' \
    -e 's/#1e293b/neutral-800/gi' \
    -e 's/#0f172a/neutral-900/gi' \
    "$file"
done

echo "✅ Hardcoded hex colors replaced"
echo ""

# Phase 2: Replace stone- → neutral-
echo "🔄 Phase 2: Replacing stone- with neutral-..."
echo "---------------------------------------------------"

find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -print0 | while IFS= read -r -d '' file; do
  sed -i '' 's/stone-/neutral-/g' "$file"
done

echo "✅ Stone palette replaced with neutral"
echo ""

# Phase 3: Update specific component patterns
echo "🔄 Phase 3: Updating component-specific patterns..."
echo "---------------------------------------------------"

# Update bg-background and text-foreground (shadcn convention)
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  # These are already handled by shadcn variables, no change needed
  # but we'll log the file for review
  if grep -q "bg-background\|text-foreground" "$file"; then
    echo "  ℹ️  Found shadcn variables in: $file (no changes needed)"
  fi
done

echo "✅ Component patterns verified"
echo ""

# Phase 4: Statistics
echo "📊 Migration Statistics"
echo "---------------------------------------------------"

NEUTRAL_COUNT=$(grep -r "neutral-" src --include="*.tsx" --include="*.ts" | wc -l | tr -d ' ')
ORANGE_COUNT=$(grep -r "orange-" src --include="*.tsx" --include="*.ts" | wc -l | tr -d ' ')
STONE_COUNT=$(grep -r "stone-" src --include="*.tsx" --include="*.ts" | wc -l | tr -d ' ')

echo "  Neutral references: $NEUTRAL_COUNT"
echo "  Orange references: $ORANGE_COUNT"
echo "  Remaining stone references: $STONE_COUNT"
echo ""

# Check for remaining hardcoded colors
echo "🔍 Checking for remaining hardcoded colors..."
REMAINING_HEX=$(grep -r "#[0-9a-fA-F]\{6\}" src --include="*.tsx" --include="*.ts" --include="*.css" | wc -l | tr -d ' ')

if [ "$REMAINING_HEX" -gt 0 ]; then
  echo "  ⚠️  Found $REMAINING_HEX remaining hardcoded hex colors"
  echo "  Run: grep -r \"#[0-9a-fA-F]\{6\}\" src --include=\"*.tsx\""
  echo "  to review them manually"
else
  echo "  ✅ No hardcoded hex colors remaining!"
fi
echo ""

# Summary
echo "================================================"
echo "✨ Color Migration Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Review changes: git diff src/"
echo "2. Test the application: bun dev"
echo "3. Run linter: bun run check"
echo "4. Commit changes: git add . && git commit -m 'feat: migrate to neutral+orange color system'"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
