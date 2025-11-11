#!/bin/bash

# =============================================================================
# Create Deployment Guard Workflow
# =============================================================================
# This script creates a GitHub Action that prevents Dependabot PRs from
# triggering preview deployments
#
# Usage: bash scripts/create-deployment-guard.sh
# =============================================================================

set -e

WORKFLOW_DIR=".github/workflows"
WORKFLOW_FILE="$WORKFLOW_DIR/deployment-guard.yml"

echo "🛡️  Creating deployment guard workflow..."
echo ""

# Create workflows directory if it doesn't exist
mkdir -p "$WORKFLOW_DIR"

# Create the workflow file
cat > "$WORKFLOW_FILE" << 'EOF'
name: Deployment Guard

# This workflow prevents unnecessary deployments for specific scenarios
# - Skips deployments for Dependabot PRs
# - Skips deployments for commits with [skip deploy] flag
# - Adds helpful comments to PRs

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - 'dependabot/**'

jobs:
  check-deployment-skip:
    name: Check if deployment should be skipped
    runs-on: ubuntu-latest

    steps:
      - name: Check if Dependabot PR
        id: check_dependabot
        if: github.actor == 'dependabot[bot]'
        run: |
          echo "skip=true" >> $GITHUB_OUTPUT
          echo "🤖 Dependabot PR detected - deployment will be skipped"

      - name: Check commit message for skip flag
        id: check_commit
        if: steps.check_dependabot.outputs.skip != 'true'
        run: |
          if [[ "${{ github.event.head_commit.message }}" =~ \[skip\ deploy\] ]]; then
            echo "skip=true" >> $GITHUB_OUTPUT
            echo "⏭️  [skip deploy] flag detected in commit message"
          else
            echo "skip=false" >> $GITHUB_OUTPUT
          fi

      - name: Comment on Dependabot PR
        if: github.event_name == 'pull_request' && github.actor == 'dependabot[bot]'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Deployment Preview Disabled**\n\nPreview deployments are automatically skipped for Dependabot PRs to reduce deployment noise and costs.\n\n✅ This PR will still be tested by CI/CD\n✅ Production deployment will occur after merge to `main`'
            })

      - name: Output deployment decision
        run: |
          if [[ "${{ steps.check_dependabot.outputs.skip }}" == "true" ]] || [[ "${{ steps.check_commit.outputs.skip }}" == "true" ]]; then
            echo "🛑 Deployment will be SKIPPED"
            echo "Reason: Dependabot PR or [skip deploy] flag"
          else
            echo "✅ Deployment will PROCEED"
          fi

  notify-skip:
    name: Notify deployment skip
    runs-on: ubuntu-latest
    needs: check-deployment-skip
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Add label to Dependabot PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.addLabels({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: ['no-deploy', 'dependencies']
            })
EOF

echo "✅ Deployment guard workflow created at $WORKFLOW_FILE"
echo ""
echo "This workflow will:"
echo "  🛑 Skip deployments for Dependabot PRs"
echo "  💬 Add comments explaining deployment skip"
echo "  🏷️  Add 'no-deploy' label to Dependabot PRs"
echo "  📝 Support [skip deploy] flag in commit messages"
echo ""
echo "To apply changes:"
echo "  git add .github/workflows/deployment-guard.yml"
echo "  git commit -m 'ci: add deployment guard to reduce preview deployments'"
echo "  git push origin main"
echo ""
