#!/bin/bash
# Deployment gate script for Vercel
# Determines if the current commit should trigger a deployment

# Get the commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Check if commit message contains [skip deploy]
if echo "$COMMIT_MSG" | grep -q "\[skip deploy\]"; then
  echo "🚫 Skipping deployment - [skip deploy] found in commit message"
  exit 0
fi

# Skip deployment for chore and docs commits (optional)
if echo "$COMMIT_MSG" | grep -qE "^(chore|docs):"; then
  echo "ℹ️  Commit type suggests no deployment needed (chore/docs)"
  echo "✅ Proceeding with deployment anyway (can be configured)"
  exit 1
fi

# Default: proceed with deployment
echo "✅ Proceeding with deployment"
exit 1
