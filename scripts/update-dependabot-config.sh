#!/bin/bash

# =============================================================================
# Update Dependabot Configuration
# =============================================================================
# This script updates .github/dependabot.yml to reduce deployment noise
#
# Changes:
# - Weekly → Monthly updates
# - 10 → 3 max open PRs
# - Better grouping strategy
#
# Usage: bash scripts/update-dependabot-config.sh
# =============================================================================

set -e

CONFIG_FILE=".github/dependabot.yml"

echo "🔧 Updating Dependabot configuration..."
echo ""

# Backup existing config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo "📦 Backup created: $CONFIG_FILE.backup"

# Create new optimized config
cat > "$CONFIG_FILE" << 'EOF'
# GitHub Dependabot Configuration - OPTIMIZED
# Reduces deployment noise by limiting PR frequency and grouping updates
# Documentation: https://docs.github.com/en/code-security/dependabot

version: 2
updates:
  # Monitor npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "monthly"  # Changed from weekly to reduce noise
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 3  # Reduced from 10 to limit preview deployments

    # Group updates intelligently
    groups:
      # Group all production dependencies together
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "@storybook/*"
          - "@playwright/*"
          - "@biomejs/*"
        update-types:
          - "minor"
          - "patch"

      # Separate group for dev dependencies
      dev-dependencies:
        patterns:
          - "@types/*"
          - "@storybook/*"
          - "@playwright/*"
          - "@biomejs/*"
        update-types:
          - "minor"
          - "patch"

    # Automated labels
    labels:
      - "dependencies"
      - "automated"

    # Commit message configuration
    commit-message:
      prefix: "chore(deps)"
      prefix-development: "chore(deps-dev)"
      include: "scope"

    # Only allow specific dependency types
    allow:
      - dependency-type: "all"

    # Ignore major version updates (require manual review)
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # Monitor GitHub Actions (keep weekly for security)
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    labels:
      - "github-actions"
      - "dependencies"
    commit-message:
      prefix: "ci"
EOF

echo "✅ Dependabot configuration updated"
echo ""
echo "Key changes:"
echo "  📅 Update frequency: Weekly → Monthly"
echo "  📊 Max open PRs: 10 → 3"
echo "  📦 Better grouping: Separate prod/dev dependencies"
echo "  🚫 Ignore major version updates (manual review required)"
echo ""
echo "To apply changes:"
echo "  git add .github/dependabot.yml"
echo "  git commit -m 'chore: optimize Dependabot config to reduce deployments'"
echo "  git push origin main"
echo ""
echo "To restore backup:"
echo "  mv $CONFIG_FILE.backup $CONFIG_FILE"
echo ""
