#!/bin/bash

# Lia Design System Migration Script
# Migrate from Anthropic (orange/blue) to Airbnb (rausch/babu) color naming
#
# Usage: ./scripts/migrate-colors.sh
# Note: Run from project root directory

set -e

echo "🎨 Lia Design System Migration: Anthropic → Airbnb"
echo "=================================================="
echo ""

# Count occurrences before migration
echo "📊 Counting color class occurrences before migration..."
ORANGE_COUNT=$(grep -r "orange-" src --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
BLUE_COUNT=$(grep -r "blue-" src --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

echo "  - orange-* classes: $ORANGE_COUNT occurrences"
echo "  - blue-* classes: $BLUE_COUNT occurrences"
echo ""

# Migration patterns - order matters (compound patterns first)
echo "🔄 Migrating orange → rausch..."

# Orange opacity variants first (compound patterns)
declare -a orange_opacity_patterns=(
  "orange-500/90:rausch-500/90"
  "orange-500/80:rausch-500/80"
  "orange-500/70:rausch-500/70"
  "orange-500/60:rausch-500/60"
  "orange-500/50:rausch-500/50"
  "orange-500/40:rausch-500/40"
  "orange-500/30:rausch-500/30"
  "orange-500/20:rausch-500/20"
  "orange-500/10:rausch-500/10"
  "orange-50/90:rausch-50/90"
  "orange-50/80:rausch-50/80"
  "orange-50/70:rausch-50/70"
  "orange-50/60:rausch-50/60"
  "orange-50/50:rausch-50/50"
  "orange-50/40:rausch-50/40"
  "orange-50/30:rausch-50/30"
  "orange-50/20:rausch-50/20"
  "orange-50/10:rausch-50/10"
  "orange-100/50:rausch-100/50"
  "orange-200/50:rausch-200/50"
  "orange-600/20:rausch-600/20"
)

for pattern in "${orange_opacity_patterns[@]}"; do
  from="${pattern%%:*}"
  to="${pattern##*:}"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/${from}/${to}/g" {} + 2>/dev/null || true
done

# Orange simple shades (reverse order to avoid partial matches)
declare -a orange_patterns=(
  "orange-950:rausch-900"
  "orange-900:rausch-900"
  "orange-800:rausch-800"
  "orange-700:rausch-700"
  "orange-600:rausch-600"
  "orange-500:rausch-500"
  "orange-400:rausch-400"
  "orange-300:rausch-300"
  "orange-200:rausch-200"
  "orange-100:rausch-100"
  "orange-50:rausch-50"
)

for pattern in "${orange_patterns[@]}"; do
  from="${pattern%%:*}"
  to="${pattern##*:}"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/${from}/${to}/g" {} + 2>/dev/null || true
done

echo "✅ Orange → Rausch migration complete"
echo ""

echo "🔄 Migrating blue → babu..."

# Blue opacity variants first
declare -a blue_opacity_patterns=(
  "blue-500/50:babu-500/50"
  "blue-500/20:babu-500/20"
  "blue-500/10:babu-500/10"
  "blue-50/50:babu-50/50"
)

for pattern in "${blue_opacity_patterns[@]}"; do
  from="${pattern%%:*}"
  to="${pattern##*:}"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/${from}/${to}/g" {} + 2>/dev/null || true
done

# Blue simple shades
declare -a blue_patterns=(
  "blue-900:babu-900"
  "blue-800:babu-800"
  "blue-700:babu-700"
  "blue-600:babu-600"
  "blue-500:babu-500"
  "blue-400:babu-400"
  "blue-300:babu-300"
  "blue-200:babu-200"
  "blue-100:babu-100"
  "blue-50:babu-50"
)

for pattern in "${blue_patterns[@]}"; do
  from="${pattern%%:*}"
  to="${pattern##*:}"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/${from}/${to}/g" {} + 2>/dev/null || true
done

echo "✅ Blue → Babu migration complete"
echo ""

# Count occurrences after migration
echo "📊 Counting color class occurrences after migration..."
RAUSCH_COUNT=$(grep -r "rausch-" src --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
BABU_COUNT=$(grep -r "babu-" src --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
REMAINING_ORANGE=$(grep -r "orange-" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "globals.css" | wc -l | tr -d ' ')
REMAINING_BLUE=$(grep -r "blue-" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "globals.css" | wc -l | tr -d ' ')

echo "  - rausch-* classes: $RAUSCH_COUNT occurrences"
echo "  - babu-* classes: $BABU_COUNT occurrences"
echo "  - Remaining orange-* (excluding globals.css): $REMAINING_ORANGE"
echo "  - Remaining blue-* (excluding globals.css): $REMAINING_BLUE"
echo ""

echo "🎉 Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'bun run build' to verify no TypeScript errors"
echo "  2. Run 'bun run check' to verify Biome formatting"
echo "  3. Review visual changes in browser"
echo "  4. Check WCAG contrast compliance"
