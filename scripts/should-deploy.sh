#!/bin/bash

# =============================================================================
# Vercel Deployment Decision Script
# =============================================================================
# This script determines whether Vercel should deploy a preview
# Exit 1 = Deploy, Exit 0 = Skip deployment
#
# Configure in Vercel Dashboard:
# Settings > Git > Ignored Build Step > Command: bash scripts/should-deploy.sh
# =============================================================================

echo "🔍 Checking if deployment should proceed..."

# Get commit info from Vercel environment variables
BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
AUTHOR="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
MESSAGE="${VERCEL_GIT_COMMIT_MESSAGE:-}"

echo "Branch: $BRANCH"
echo "Author: $AUTHOR"
echo "Message: $MESSAGE"
echo ""

# Skip deployment for Dependabot branches
if [[ "$BRANCH" =~ ^dependabot/.* ]]; then
  echo "🛑 SKIP: Dependabot branch detected"
  echo "Reason: Preview deployments disabled for dependency updates"
  exit 0
fi

# Skip deployment for dependabot author
if [[ "$AUTHOR" == "dependabot"* ]]; then
  echo "🛑 SKIP: Dependabot commit detected"
  exit 0
fi

# Skip deployment if commit message contains skip flag
if [[ "$MESSAGE" =~ \[skip\ deploy\] ]] || [[ "$MESSAGE" =~ \[skip\ ci\] ]]; then
  echo "🛑 SKIP: Skip flag in commit message"
  exit 0
fi

# Skip deployment for documentation-only changes
if [[ "$MESSAGE" =~ ^docs: ]] || [[ "$MESSAGE" =~ ^docs\( ]]; then
  echo "🛑 SKIP: Documentation-only changes"
  exit 0
fi

# Skip deployment for chore commits (unless it's a release)
if [[ "$MESSAGE" =~ ^chore: ]] || [[ "$MESSAGE" =~ ^chore\( ]]; then
  if [[ ! "$MESSAGE" =~ release ]]; then
    echo "🛑 SKIP: Chore commit (non-release)"
    exit 0
  fi
fi

# All checks passed - proceed with deployment
echo "✅ DEPLOY: All checks passed"
exit 1
