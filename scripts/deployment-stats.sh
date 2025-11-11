#!/bin/bash

# =============================================================================
# Deployment Statistics
# =============================================================================
# Shows detailed statistics about your deployments to help you decide
# what to clean up
# =============================================================================

set -e

REPO="rossostudios/casaora"

echo "📊 Deployment Statistics for $REPO"
echo "========================================"
echo ""

# Get all deployments
echo "🔍 Fetching deployment data..."
DEPLOYMENTS=$(gh api "repos/$REPO/deployments?per_page=100" --jq '.[] | "\(.id)|\(.environment)|\(.created_at)|\(.task)|\(.ref)|\(.creator.login)"')

TOTAL=$(echo "$DEPLOYMENTS" | wc -l | xargs)

echo "Total deployments: $TOTAL"
echo ""

# Count by environment
echo "📦 By Environment:"
echo "$DEPLOYMENTS" | cut -d'|' -f2 | sort | uniq -c | sort -rn | while read count env; do
  printf "  %-20s: %3d deployments\n" "$env" "$count"
done
echo ""

# Count by time period
echo "📅 By Time Period:"
NOW=$(date -u +%s)
DAY_SECONDS=86400

LAST_24H=$(echo "$DEPLOYMENTS" | while IFS='|' read -r id env created rest; do
  created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created" +%s 2>/dev/null || date -d "$created" +%s 2>/dev/null)
  age_days=$(( (NOW - created_ts) / DAY_SECONDS ))
  [ $age_days -eq 0 ] && echo "1"
done | wc -l | xargs)

LAST_7D=$(echo "$DEPLOYMENTS" | while IFS='|' read -r id env created rest; do
  created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created" +%s 2>/dev/null || date -d "$created" +%s 2>/dev/null)
  age_days=$(( (NOW - created_ts) / DAY_SECONDS ))
  [ $age_days -le 7 ] && echo "1"
done | wc -l | xargs)

LAST_30D=$(echo "$DEPLOYMENTS" | while IFS='|' read -r id env created rest; do
  created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created" +%s 2>/dev/null || date -d "$created" +%s 2>/dev/null)
  age_days=$(( (NOW - created_ts) / DAY_SECONDS ))
  [ $age_days -le 30 ] && echo "1"
done | wc -l | xargs)

OLDER=$(( TOTAL - LAST_30D ))

printf "  Last 24 hours: %3d\n" "$LAST_24H"
printf "  Last 7 days:   %3d\n" "$LAST_7D"
printf "  Last 30 days:  %3d\n" "$LAST_30D"
printf "  Older:         %3d (candidates for cleanup)\n" "$OLDER"
echo ""

# Recent deployments
echo "🕐 Most Recent Deployments:"
echo "$DEPLOYMENTS" | head -5 | while IFS='|' read -r id env created task ref creator; do
  created_date=$(echo $created | cut -d'T' -f1)
  created_time=$(echo $created | cut -d'T' -f2 | cut -d'.' -f1)
  printf "  %-12s | %-20s | %s %s | %s\n" "$env" "$ref" "$created_date" "$created_time" "$task"
done
echo ""

# Deployment creators
echo "👤 Top Deployment Creators:"
echo "$DEPLOYMENTS" | cut -d'|' -f6 | sort | uniq -c | sort -rn | head -5 | while read count creator; do
  printf "  %-20s: %3d deployments\n" "$creator" "$count"
done
echo ""

echo "========================================"
echo "💡 Recommendations:"
echo ""

if [ $OLDER -gt 50 ]; then
  echo "  ⚠️  You have $OLDER old deployments (>30 days)"
  echo "  Recommend: bash scripts/cleanup-old-deployments.sh --older-than 30 --dry-run"
  echo ""
fi

PREVIEW_COUNT=$(echo "$DEPLOYMENTS" | grep -c "Preview" || echo 0)
if [ $PREVIEW_COUNT -gt 30 ]; then
  echo "  ⚠️  You have $PREVIEW_COUNT Preview deployments"
  echo "  Recommend: bash scripts/cleanup-preview-deployments.sh"
  echo ""
fi

if [ $LAST_24H -gt 10 ]; then
  echo "  ⚠️  $LAST_24H deployments in last 24 hours (high volume)"
  echo "  Make sure you've configured deployment guards!"
  echo ""
fi

echo "To clean up old deployments:"
echo "  bash scripts/cleanup-old-deployments.sh --dry-run    (preview changes)"
echo "  bash scripts/cleanup-preview-deployments.sh          (safe - preview only)"
echo ""
