#!/bin/bash

# =============================================================================
# Clean Up Preview Deployments Only
# =============================================================================
# Quick script to remove all old Preview environment deployments
# while keeping Production deployments intact
#
# This is the SAFE option - only touches preview/staging deployments
# =============================================================================

set -e

REPO="rossostudios/casaora"

echo "🧹 Cleaning up Preview deployments only..."
echo "Repository: $REPO"
echo ""

# Safety check
read -p "This will delete old Preview deployments. Continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

echo "🔍 Fetching Preview deployments..."

# Get all preview deployments (skip first 5 to keep recent ones)
PREVIEW_DEPLOYMENTS=$(gh api "repos/$REPO/deployments?environment=Preview&per_page=100" \
  --jq '.[] | select(.created_at < (now - 7*24*60*60 | todate)) | .id' 2>/dev/null || echo "")

if [ -z "$PREVIEW_DEPLOYMENTS" ]; then
  echo "✅ No old Preview deployments to clean up!"
  exit 0
fi

TOTAL=$(echo "$PREVIEW_DEPLOYMENTS" | wc -l | xargs)
echo "📊 Found $TOTAL old Preview deployments to delete"
echo ""

DELETED=0
echo "🗑️  Deleting..."

for deployment_id in $PREVIEW_DEPLOYMENTS; do
  printf "  Deleting deployment $deployment_id... "

  # Mark as inactive first
  gh api "repos/$REPO/deployments/$deployment_id/statuses" \
    --method POST \
    --field state=inactive \
    --silent 2>/dev/null || true

  # Delete deployment
  if gh api "repos/$REPO/deployments/$deployment_id" \
    --method DELETE \
    --silent 2>/dev/null; then
    echo "✅"
    DELETED=$((DELETED + 1))
  else
    echo "⚠️  (skipped - may be active)"
  fi

  sleep 0.1  # Rate limit protection
done

echo ""
echo "✨ Done! Deleted $DELETED Preview deployments"
echo ""
echo "View remaining: https://github.com/$REPO/deployments"
echo ""
