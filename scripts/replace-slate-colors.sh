#!/bin/bash

# Replace all slate- color classes with neutral- across the entire src directory
# Usage: bash scripts/replace-slate-colors.sh

echo "🎨 Replacing slate colors with neutral colors..."
echo ""

# Count slate references before replacement
BEFORE_COUNT=$(grep -r "slate-" src --include="*.tsx" --include="*.ts" --include="*.css" | wc -l | tr -d ' ')
echo "📊 Found $BEFORE_COUNT slate color references"
echo ""

# Replace slate- with neutral- in all TypeScript, TSX, and CSS files
echo "🔄 Processing files..."
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -print0 | while IFS= read -r -d '' file; do
  # Use sed to replace all instances of slate- with neutral-
  sed -i '' 's/slate-/neutral-/g' "$file"
done

# Count neutral references after replacement
AFTER_COUNT=$(grep -r "neutral-" src --include="*.tsx" --include="*.ts" --include="*.css" | wc -l | tr -d ' ')
REMAINING_SLATE=$(grep -r "slate-" src --include="*.tsx" --include="*.ts" --include="*.css" | wc -l | tr -d ' ')

echo ""
echo "✅ Replacement complete!"
echo ""
echo "📊 Final Statistics:"
echo "  - Neutral color references: $AFTER_COUNT"
echo "  - Remaining slate references: $REMAINING_SLATE"
echo ""

if [ "$REMAINING_SLATE" -gt 0 ]; then
  echo "⚠️  There are still $REMAINING_SLATE slate references remaining."
  echo "    These may be in comments, strings, or non-color contexts."
else
  echo "🎉 All slate colors successfully replaced with neutral!"
fi
