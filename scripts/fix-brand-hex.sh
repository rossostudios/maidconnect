#!/bin/bash
# Fix brand color hex codes - replace with Tailwind custom utilities
# Brand colors from globals.css:
# --color-orange: #E85D48
# --color-silver: #FEF8E8
# --color-grey: #E4E2E3
# --color-midnight: #161616

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe '
  # Brand orange (#E85D48)
  s/bg-\[#E85D48\]/bg-orange/g;
  s/text-\[#E85D48\]/text-orange/g;
  s/border-\[#E85D48\]/border-orange/g;

  # Brand silver/cream (#FEF8E8)
  s/bg-\[#FEF8E8\]/bg-silver/g;
  s/text-\[#FEF8E8\]/text-silver/g;
  s/border-\[#FEF8E8\]/border-silver/g;

  # Brand grey (#E4E2E3)
  s/bg-\[#E4E2E3\]/bg-grey/g;
  s/text-\[#E4E2E3\]/text-grey/g;
  s/border-\[#E4E2E3\]/border-grey/g;

  # Brand midnight (#161616)
  s/bg-\[#161616\]/bg-midnight/g;
  s/text-\[#161616\]/text-midnight/g;
  s/border-\[#161616\]/border-midnight/g;

  # Similar near-black colors to midnight
  s/text-\[#1A1A1A\]/text-midnight/g;

  # Secondary brand colors
  s/bg-\[#D64A36\]/bg-orange/g;  # Darker orange variant -> use main orange
  s/bg-\[#D32F40\]/bg-orange/g;  # Red-orange variant -> use main orange
  s/text-\[#D32F40\]/text-orange/g;
  s/bg-\[#F44A22\]/bg-orange/g;  # Lighter orange variant -> use main orange
  s/text-\[#F44A22\]/text-orange/g;

  # Off-white/cream variations -> use silver or neutral
  s/bg-\[#fbfafa\]/bg-neutral-50/g;
  s/bg-\[#FAFAF9\]/bg-neutral-50/g;
  s/bg-\[#FEF2F2\]/bg-neutral-50/g;
  s/bg-\[#FFF4E6\]/bg-silver/g;  # Light orange/cream -> silver

  # Gray text colors -> neutral scale
  s/text-\[#A8AAAC\]/text-neutral-400/g;
  s/text-\[#6A6A6A\]/text-neutral-500/g;

  # Tan/brown borders -> grey
  s/border-\[#ebe5d8\]/border-grey/g;
  s/border-\[#e5dfd4\]/border-grey/g;

  # Tan/brown text -> neutral
  s/text-\[#7d7566\]/text-neutral-600/g;
  s/text-\[#9d9383\]/text-neutral-500/g;

  # Success green (keep as-is for status indicators)
  # s/bg-\[#E8F5E9\]/bg-green-50/g;
  # s/text-\[#2E7D32\]/text-green-700/g;
  # s/border-\[#C8E6C9\]/border-green-200/g;

  # Warning orange (keep specific for status)
  # s/text-\[#FF8A00\]/text-orange-600/g;
  # s/border-\[#FFE0B2\]/border-orange-200/g;
' {} \;

echo "✅ Fixed brand color hex codes"
