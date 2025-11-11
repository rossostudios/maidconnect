#!/bin/bash
# Fix corrupted hex values from bad regex replacement

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe '
  # Fix corrupted midnight (#116611616 → midnight)
  s/bg-\[#116611616\]/bg-midnight/g;
  s/text-\[#116611616\]/text-midnight/g;
  s/border-\[#116611616\]/border-midnight/g;

  # Fix corrupted silver (#FFEEFF8E8 → silver)
  s/bg-\[#FFEEFF8E8\]/bg-silver/g;
  s/text-\[#FFEEFF8E8\]/text-silver/g;
  s/border-\[#FFEEFF8E8\]/border-silver/g;

  # Fix corrupted grey (#EE44EE2E3 → grey)
  s/bg-\[#EE44EE2E3\]/bg-grey/g;
  s/text-\[#EE44EE2E3\]/text-grey/g;
  s/border-\[#EE44EE2E3\]/border-grey/g;

  # Fix corrupted orange (#FF4444A22 → orange)
  s/bg-\[#FF4444A22\]/bg-orange/g;
  s/text-\[#FF4444A22\]/text-orange/g;
  s/border-\[#FF4444A22\]/border-orange/g;

  # Fix corrupted gray (#AA88AAAAC → neutral-400)
  s/bg-\[#AA88AAAAC\]/bg-neutral-400/g;
  s/text-\[#AA88AAAAC\]/text-neutral-400/g;
  s/border-\[#AA88AAAAC\]/border-neutral-400/g;
' {} \;

echo "✅ Fixed corrupted hex values"
