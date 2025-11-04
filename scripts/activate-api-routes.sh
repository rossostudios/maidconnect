#!/bin/bash
# Script to activate all refactored API routes
# This script:
# 1. Backs up original route.ts files to route.ts.backup
# 2. Renames route.refactored.ts files to route.ts
# 3. Keeps a log of all changes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/scripts/activation-log-$(date +%Y%m%d-%H%M%S).txt"

echo "==================================" | tee -a "$LOG_FILE"
echo "API Routes Activation Script" | tee -a "$LOG_FILE"
echo "Started at: $(date)" | tee -a "$LOG_FILE"
echo "==================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

cd "$PROJECT_ROOT"

# Find all refactored files
REFACTORED_FILES=$(find src/app/api -name "*.refactored.ts" | sort)
TOTAL_COUNT=$(echo "$REFACTORED_FILES" | wc -l | tr -d ' ')

echo "Found $TOTAL_COUNT refactored files to activate" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

ACTIVATED_COUNT=0
ERROR_COUNT=0

for REFACTORED in $REFACTORED_FILES; do
  ORIGINAL="${REFACTORED%.refactored.ts}.ts"
  BACKUP="${REFACTORED%.refactored.ts}.ts.backup"

  echo "Processing: $REFACTORED" | tee -a "$LOG_FILE"

  # Check if original exists
  if [ ! -f "$ORIGINAL" ]; then
    echo "  ERROR: Original file not found: $ORIGINAL" | tee -a "$LOG_FILE"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    continue
  fi

  # Check if backup already exists
  if [ -f "$BACKUP" ]; then
    echo "  WARNING: Backup already exists: $BACKUP (skipping backup step)" | tee -a "$LOG_FILE"
  else
    # Backup original
    echo "  Backing up: $ORIGINAL -> $BACKUP" | tee -a "$LOG_FILE"
    mv "$ORIGINAL" "$BACKUP"
  fi

  # Activate refactored version
  echo "  Activating: $REFACTORED -> $ORIGINAL" | tee -a "$LOG_FILE"
  mv "$REFACTORED" "$ORIGINAL"

  echo "  SUCCESS" | tee -a "$LOG_FILE"
  ACTIVATED_COUNT=$((ACTIVATED_COUNT + 1))
  echo "" | tee -a "$LOG_FILE"
done

echo "==================================" | tee -a "$LOG_FILE"
echo "Activation Complete" | tee -a "$LOG_FILE"
echo "Total files: $TOTAL_COUNT" | tee -a "$LOG_FILE"
echo "Activated: $ACTIVATED_COUNT" | tee -a "$LOG_FILE"
echo "Errors: $ERROR_COUNT" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Finished at: $(date)" | tee -a "$LOG_FILE"
echo "==================================" | tee -a "$LOG_FILE"

if [ $ERROR_COUNT -gt 0 ]; then
  exit 1
fi

exit 0
