#!/bin/bash

# =============================================================================
# Clean Up Old GitHub Deployments
# =============================================================================
# This script removes old/inactive deployments from GitHub to reduce clutter
#
# CAUTION: This will permanently delete deployment records!
# Review the list before confirming deletion.
#
# Usage: bash scripts/cleanup-old-deployments.sh [options]
#
# Options:
#   --dry-run          Show what would be deleted without actually deleting
#   --keep-last N      Keep the N most recent deployments (default: 10)
#   --environment ENV  Only clean specific environment (production/preview)
#   --older-than DAYS  Only delete deployments older than N days (default: 7)
# =============================================================================

set -e

REPO="rossostudios/casaora"
DRY_RUN=false
KEEP_LAST=10
ENVIRONMENT=""
OLDER_THAN_DAYS=7

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --keep-last)
      KEEP_LAST="$2"
      shift 2
      ;;
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --older-than)
      OLDER_THAN_DAYS="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "🧹 GitHub Deployment Cleanup Tool"
echo "=================================="
echo "Repository: $REPO"
echo "Keep last: $KEEP_LAST deployments"
echo "Older than: $OLDER_THAN_DAYS days"
[ -n "$ENVIRONMENT" ] && echo "Environment: $ENVIRONMENT"
[ "$DRY_RUN" = true ] && echo "Mode: DRY RUN (no changes will be made)"
echo ""

# Calculate cutoff date
CUTOFF_DATE=$(date -u -v-${OLDER_THAN_DAYS}d +%Y-%m-%d 2>/dev/null || date -u -d "${OLDER_THAN_DAYS} days ago" +%Y-%m-%d)
echo "📅 Will delete deployments older than: $CUTOFF_DATE"
echo ""

# Get all deployments
echo "🔍 Fetching deployments..."
if [ -n "$ENVIRONMENT" ]; then
  DEPLOYMENTS=$(gh api "repos/$REPO/deployments?environment=$ENVIRONMENT&per_page=100" --jq '.[] | "\(.id)|\(.environment)|\(.created_at)|\(.task)|\(.ref)"')
else
  DEPLOYMENTS=$(gh api "repos/$REPO/deployments?per_page=100" --jq '.[] | "\(.id)|\(.environment)|\(.created_at)|\(.task)|\(.ref)"')
fi

if [ -z "$DEPLOYMENTS" ]; then
  echo "✅ No deployments found to clean up!"
  exit 0
fi

# Count total deployments
TOTAL_COUNT=$(echo "$DEPLOYMENTS" | wc -l | xargs)
echo "📊 Found $TOTAL_COUNT total deployments"
echo ""

# Filter deployments older than cutoff date (skip the most recent KEEP_LAST)
DEPLOYMENTS_TO_DELETE=$(echo "$DEPLOYMENTS" | tail -n +$((KEEP_LAST + 1)) | while IFS='|' read -r id env created task ref; do
  created_date=$(echo $created | cut -d'T' -f1)
  if [[ "$created_date" < "$CUTOFF_DATE" ]]; then
    echo "$id|$env|$created|$task|$ref"
  fi
done)

if [ -z "$DEPLOYMENTS_TO_DELETE" ]; then
  echo "✅ No old deployments found matching criteria!"
  echo ""
  echo "All deployments are either:"
  echo "  - Within the last $KEEP_LAST deployments (kept)"
  echo "  - Newer than $OLDER_THAN_DAYS days"
  exit 0
fi

DELETE_COUNT=$(echo "$DEPLOYMENTS_TO_DELETE" | wc -l | xargs)
KEEP_COUNT=$((TOTAL_COUNT - DELETE_COUNT))

echo "📋 Deployment Summary:"
echo "  Total deployments: $TOTAL_COUNT"
echo "  Will keep: $KEEP_COUNT (most recent)"
echo "  Will delete: $DELETE_COUNT (old/inactive)"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN - Deployments that would be deleted:"
  echo ""
  echo "$DEPLOYMENTS_TO_DELETE" | while IFS='|' read -r id env created task ref; do
    echo "  🗑️  ID: $id | Env: $env | Created: $created | Ref: $ref"
  done
  echo ""
  echo "To actually delete, run without --dry-run flag"
  exit 0
fi

# Confirm deletion
echo "⚠️  WARNING: This will permanently delete $DELETE_COUNT deployment records!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Cancelled. No deployments were deleted."
  exit 0
fi

echo "🗑️  Deleting old deployments..."
echo ""

DELETED=0
FAILED=0

echo "$DEPLOYMENTS_TO_DELETE" | while IFS='|' read -r id env created task ref; do
  printf "Deleting deployment $id ($env)... "

  # First, set all statuses to inactive
  gh api "repos/$REPO/deployments/$id/statuses" \
    --method POST \
    --field state=inactive \
    --silent 2>/dev/null || true

  # Then delete the deployment
  if gh api "repos/$REPO/deployments/$id" --method DELETE --silent 2>/dev/null; then
    echo "✅"
    DELETED=$((DELETED + 1))
  else
    echo "❌ (may have active status)"
    FAILED=$((FAILED + 1))
  fi

  # Rate limit protection
  sleep 0.1
done

echo ""
echo "=================================="
echo "✨ Cleanup Complete!"
echo "=================================="
echo "  Deleted: $DELETED deployments"
[ $FAILED -gt 0 ] && echo "  Failed: $FAILED deployments (may have active status)"
echo ""
echo "To view remaining deployments:"
echo "  https://github.com/$REPO/deployments"
echo ""
