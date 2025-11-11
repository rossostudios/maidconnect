#!/bin/bash
# Fix remaining hardcoded hex colors

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe '
  # Neutral colors
  s/bg-\[#FFFFFF\]/bg-white/g;
  s/bg-\[#F5F5F5\]/bg-neutral-100/g;
  s/bg-\[#E5E5E5\]/bg-neutral-200/g;
  s/bg-\[#D4D4D4\]/bg-neutral-300/g;
  s/bg-\[#A3A3A3\]/bg-neutral-400/g;
  s/bg-\[#737373\]/bg-neutral-500/g;
  s/bg-\[#525252\]/bg-neutral-600/g;
  s/bg-\[#404040\]/bg-neutral-700/g;
  s/bg-\[#262626\]/bg-neutral-800/g;
  s/bg-\[#171717\]/bg-neutral-900/g;
  s/bg-\[#000000\]/bg-black/g;

  s/text-\[#FFFFFF\]/text-white/g;
  s/text-\[#F5F5F5\]/text-neutral-100/g;
  s/text-\[#E5E5E5\]/text-neutral-200/g;
  s/text-\[#D4D4D4\]/text-neutral-300/g;
  s/text-\[#A3A3A3\]/text-neutral-400/g;
  s/text-\[#737373\]/text-neutral-500/g;
  s/text-\[#525252\]/text-neutral-600/g;
  s/text-\[#404040\]/text-neutral-700/g;
  s/text-\[#262626\]/text-neutral-800/g;
  s/text-\[#171717\]/text-neutral-900/g;
  s/text-\[#000000\]/text-black/g;

  s/border-\[#FFFFFF\]/border-white/g;
  s/border-\[#F5F5F5\]/border-neutral-100/g;
  s/border-\[#E5E5E5\]/border-neutral-200/g;
  s/border-\[#D4D4D4\]/border-neutral-300/g;
  s/border-\[#404040\]/border-neutral-700/g;
  s/border-\[#171717\]/border-neutral-900/g;

  # Brand orange colors (keep in globals.css as custom)
  # #E85D48, #D64A36, #D32F40 are brand colors - leave as-is or use custom CSS vars
' {} \;

echo "✅ Fixed neutral colors"
