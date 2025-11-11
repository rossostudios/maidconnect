#!/bin/bash

# =============================================================================
# Create Weekly Release
# =============================================================================
# This script automates the weekly release process:
# 1. Merges develop → main
# 2. Creates GitHub release with changelog
# 3. Triggers production deployment
#
# Usage: bash scripts/create-release.sh [version]
# Example: bash scripts/create-release.sh v1.2.0
# =============================================================================

set -e

REPO="rossostudios/casaora"
VERSION="${1:-}"
CURRENT_BRANCH=$(git branch --show-current)

echo "🚀 MaidConnect Release Creator"
echo "================================"
echo ""

# =============================================================================
# Validation
# =============================================================================

# Check if on develop branch
if [ "$CURRENT_BRANCH" != "develop" ]; then
  echo "⚠️  Warning: You're not on 'develop' branch (currently on: $CURRENT_BRANCH)"
  read -p "Continue anyway? (yes/no): " -r
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Cancelled"
    exit 1
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: You have uncommitted changes"
  echo "Please commit or stash your changes first"
  exit 1
fi

# Determine version
if [ -z "$VERSION" ]; then
  # Auto-generate version from last tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
  echo "📌 Last release: $LAST_TAG"
  echo ""

  # Parse version (assuming semver)
  VERSION_PARTS=(${LAST_TAG//v/})
  VERSION_PARTS=(${VERSION_PARTS//./ })
  MAJOR=${VERSION_PARTS[0]:-0}
  MINOR=${VERSION_PARTS[1]:-0}
  PATCH=${VERSION_PARTS[2]:-0}

  # Default to minor version bump
  NEW_MINOR=$((MINOR + 1))
  VERSION="v${MAJOR}.${NEW_MINOR}.0"

  echo "Suggested version: $VERSION"
  read -p "Use this version? (yes/no/custom): " -r

  if [[ $REPLY =~ ^[Nn][Oo]$ ]]; then
    echo "❌ Cancelled"
    exit 1
  elif [[ $REPLY =~ ^[Cc][Uu][Ss][Tt][Oo][Mm]$ ]]; then
    read -p "Enter version (e.g., v1.2.0): " VERSION
  fi
fi

echo ""
echo "📦 Creating release: $VERSION"
echo ""

# =============================================================================
# Generate Changelog
# =============================================================================

echo "📝 Generating changelog..."

# Get commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  COMMITS=$(git log $LAST_TAG..HEAD --oneline --no-merges)
  COMMIT_RANGE="$LAST_TAG..HEAD"
else
  COMMITS=$(git log --oneline --no-merges -n 20)
  COMMIT_RANGE="(first 20 commits)"
fi

# Categorize commits
FEATURES=$(echo "$COMMITS" | grep -E "^[a-f0-9]+ (feat|feature)" || echo "")
FIXES=$(echo "$COMMITS" | grep -E "^[a-f0-9]+ (fix|bugfix)" || echo "")
CHORES=$(echo "$COMMITS" | grep -E "^[a-f0-9]+ (chore|refactor|docs)" || echo "")
OTHER=$(echo "$COMMITS" | grep -vE "^[a-f0-9]+ (feat|feature|fix|bugfix|chore|refactor|docs)" || echo "")

# Build changelog
CHANGELOG="# Release $VERSION

## What's Changed

"

if [ -n "$FEATURES" ]; then
  CHANGELOG+="### ✨ New Features
"
  while IFS= read -r line; do
    CHANGELOG+="- $(echo "$line" | sed 's/^[a-f0-9]* //')
"
  done <<< "$FEATURES"
  CHANGELOG+="
"
fi

if [ -n "$FIXES" ]; then
  CHANGELOG+="### 🐛 Bug Fixes
"
  while IFS= read -r line; do
    CHANGELOG+="- $(echo "$line" | sed 's/^[a-f0-9]* //')
"
  done <<< "$FIXES"
  CHANGELOG+="
"
fi

if [ -n "$CHORES" ]; then
  CHANGELOG+="### 🔧 Maintenance
"
  while IFS= read -r line; do
    CHANGELOG+="- $(echo "$line" | sed 's/^[a-f0-9]* //')
"
  done <<< "$CHORES"
  CHANGELOG+="
"
fi

if [ -n "$OTHER" ]; then
  CHANGELOG+="### 📝 Other Changes
"
  while IFS= read -r line; do
    CHANGELOG+="- $(echo "$line" | sed 's/^[a-f0-9]* //')
"
  done <<< "$OTHER"
  CHANGELOG+="
"
fi

CHANGELOG+="
---

**Full Changelog**: https://github.com/$REPO/compare/$LAST_TAG...$VERSION
**Deployment**: Production deployment will occur automatically after merge to \`main\`

🚀 Generated with [MaidConnect Release Script](https://github.com/$REPO)
"

echo ""
echo "Preview of changelog:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$CHANGELOG" | head -20
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Proceed with release? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

# =============================================================================
# Create Release
# =============================================================================

echo ""
echo "🔄 Updating branches..."

# Fetch latest
git fetch origin

# Update develop
git checkout develop
git pull origin develop

# Update main
git checkout main
git pull origin main

# Merge develop into main
echo "🔀 Merging develop → main..."
git merge develop --no-ff -m "chore: release $VERSION

Merge develop branch for $VERSION release.

This release includes:
- $(echo "$FEATURES" | wc -l | xargs) new features
- $(echo "$FIXES" | wc -l | xargs) bug fixes
- $(echo "$CHORES" | wc -l | xargs) maintenance updates

Full changelog: https://github.com/$REPO/releases/tag/$VERSION"

# Create tag
echo "🏷️  Creating tag..."
git tag -a "$VERSION" -m "Release $VERSION"

# Push to remote
echo "📤 Pushing to remote..."
git push origin main
git push origin "$VERSION"

# Create GitHub release
echo "📦 Creating GitHub release..."
echo "$CHANGELOG" | gh release create "$VERSION" \
  --title "MaidConnect $VERSION" \
  --notes-file - \
  --latest

# Switch back to develop
git checkout develop

echo ""
echo "================================"
echo "✨ Release $VERSION created!"
echo "================================"
echo ""
echo "🎉 Success! Here's what happened:"
echo "  ✅ Merged develop → main"
echo "  ✅ Created tag: $VERSION"
echo "  ✅ Pushed to remote"
echo "  ✅ Created GitHub release"
echo "  🚀 Vercel deployment started automatically"
echo ""
echo "View release: https://github.com/$REPO/releases/tag/$VERSION"
echo "View deployments: https://github.com/$REPO/deployments"
echo ""
echo "Next steps:"
echo "  1. Monitor production deployment in Vercel"
echo "  2. Test critical flows on production"
echo "  3. Announce release to team/users"
echo "  4. Continue development on 'develop' branch"
echo ""
