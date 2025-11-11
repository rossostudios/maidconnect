#!/bin/bash
# Fix hardcoded hex colors in MaidConnect codebase
# Replace with proper Tailwind utility classes

echo "🔍 Finding and replacing hardcoded hex colors..."

# Common slate color replacements
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe '
  s/bg-\[#f8fafc\]/bg-slate-50/g;
  s/bg-\[#f1f5f9\]/bg-slate-100/g;
  s/bg-\[#e2e8f0\]/bg-slate-200/g;
  s/bg-\[#cbd5e1\]/bg-slate-300/g;
  s/bg-\[#94a3b8\]/bg-slate-400/g;
  s/bg-\[#64748b\]/bg-slate-500/g;
  s/bg-\[#475569\]/bg-slate-600/g;
  s/bg-\[#334155\]/bg-slate-700/g;
  s/bg-\[#1e293b\]/bg-slate-800/g;
  s/bg-\[#0f172a\]/bg-slate-900/g;

  s/text-\[#f8fafc\]/text-slate-50/g;
  s/text-\[#f1f5f9\]/text-slate-100/g;
  s/text-\[#e2e8f0\]/text-slate-200/g;
  s/text-\[#cbd5e1\]/text-slate-300/g;
  s/text-\[#94a3b8\]/text-slate-400/g;
  s/text-\[#64748b\]/text-slate-500/g;
  s/text-\[#475569\]/text-slate-600/g;
  s/text-\[#334155\]/text-slate-700/g;
  s/text-\[#1e293b\]/text-slate-800/g;
  s/text-\[#0f172a\]/text-slate-900/g;

  s/border-\[#f8fafc\]/border-slate-50/g;
  s/border-\[#f1f5f9\]/border-slate-100/g;
  s/border-\[#e2e8f0\]/border-slate-200/g;
  s/border-\[#cbd5e1\]/border-slate-300/g;
  s/border-\[#94a3b8\]/border-slate-400/g;
  s/border-\[#64748b\]/border-slate-500/g;
  s/border-\[#475569\]/border-slate-600/g;
  s/border-\[#334155\]/border-slate-700/g;
  s/border-\[#1e293b\]/border-slate-800/g;
  s/border-\[#0f172a\]/border-slate-900/g;
' {} \;

echo "✅ Hex color replacement complete"
echo "📊 Running Biome check..."
bun run check:fix
