#!/usr/bin/env bash
#
# Lia Design System Compliance Checker
#
# This script checks for common Lia Design System violations:
# - Custom hex colors (not in Lia palette)
# - Rounded corners (should be sharp edges)
# - Old fonts (Satoshi, Manrope)
# - Gray colors (should be neutral)
# - Spacing outside 8px scale
#
# Usage: ./scripts/check-lia-compliance.sh
# Exit code: 0 if all checks pass, 1 if violations found

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Lia Design System Compliance Checker"
echo "=============================================="
echo ""

VIOLATIONS_FOUND=0

# Directories to check
DIRS_TO_CHECK="src/components src/app"

# 1. Check for custom hex colors
echo "📐 Checking for custom hex colors..."
HEX_COLOR_VIOLATIONS=$(grep -r -n "#[0-9A-Fa-f]\{3,6\}" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "precision-design-system\|design-system\|globals.css" || true)

if [ -n "$HEX_COLOR_VIOLATIONS" ]; then
  echo -e "${RED}❌ Found custom hex colors (use Tailwind tokens instead):${NC}"
  echo "$HEX_COLOR_VIOLATIONS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No custom hex colors found${NC}"
fi

# 2. Check for rounded corners
echo ""
echo "📐 Checking for rounded corners..."
ROUNDED_VIOLATIONS=$(grep -r -n "rounded-md\|rounded-lg\|rounded-xl\|rounded-full\|rounded-2xl\|rounded-3xl" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep className | grep -v "precision-design-system\|design-system" || true)

if [ -n "$ROUNDED_VIOLATIONS" ]; then
  echo -e "${RED}❌ Found rounded corners (Lia uses sharp edges only):${NC}"
  echo "$ROUNDED_VIOLATIONS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No rounded corners found${NC}"
fi

# 3. Check for old font references
echo ""
echo "📐 Checking for old fonts (Satoshi, Manrope)..."
OLD_FONT_VIOLATIONS=$(grep -r -n -i "satoshi\|manrope" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "precision-design-system\|design-system\|CLAUDE.md\|fonts.ts" || true)

if [ -n "$OLD_FONT_VIOLATIONS" ]; then
  echo -e "${RED}❌ Found old font references (use Geist Sans/Mono only):${NC}"
  echo "$OLD_FONT_VIOLATIONS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No old font references found${NC}"
fi

# 4. Check for gray-* colors (should be neutral-*)
echo ""
echo "📐 Checking for gray-* colors (should be neutral-*)..."
GRAY_VIOLATIONS=$(grep -r -n "bg-gray-\|text-gray-\|border-gray-" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep className | grep -v "precision-design-system\|design-system" || true)

if [ -n "$GRAY_VIOLATIONS" ]; then
  echo -e "${YELLOW}⚠️  Found gray-* colors (prefer neutral-* palette):${NC}"
  echo "$GRAY_VIOLATIONS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No gray-* colors found${NC}"
fi

# 5. Check for spacing outside 8px scale
echo ""
echo "📐 Checking for spacing outside 8px scale..."
SPACING_VIOLATIONS=$(grep -r -n "p-5\|p-7\|p-9\|p-11\|gap-5\|gap-7\|gap-9\|gap-11\|m-5\|m-7\|m-9\|m-11" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep className | grep -v "precision-design-system\|design-system" || true)

if [ -n "$SPACING_VIOLATIONS" ]; then
  echo -e "${YELLOW}⚠️  Found spacing outside 8px scale (use 4, 6, 8, 12, 16 etc.):${NC}"
  echo "$SPACING_VIOLATIONS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No invalid spacing found${NC}"
fi

# 6. Check for border-radius in CSS (in case inline styles are used)
echo ""
echo "📐 Checking for border-radius in CSS..."
BORDER_RADIUS_CSS=$(grep -r -n "borderRadius:" $DIRS_TO_CHECK --include="*.tsx" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "precision-design-system\|design-system" || true)

if [ -n "$BORDER_RADIUS_CSS" ]; then
  echo -e "${RED}❌ Found border-radius in inline styles (use Tailwind classes):${NC}"
  echo "$BORDER_RADIUS_CSS"
  echo ""
  VIOLATIONS_FOUND=1
else
  echo -e "${GREEN}✅ No border-radius in CSS found${NC}"
fi

# Summary
echo ""
echo "=============================================="
if [ $VIOLATIONS_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ All Lia Design System checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Lia Design System violations found${NC}"
  echo ""
  echo "📋 See compliance checklists:"
  echo "  - docs/lia/checklists.md"
  echo ""
  echo "📖 Design system reference:"
  echo "  - docs/lia/foundations.md"
  exit 1
fi
