#!/bin/bash
# Rollback script for API routes activation
# This script restores all backed up route.ts.backup files to route.ts
# Use this if the refactored routes cause issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/scripts/rollback-log-$(date +%Y%m%d-%H%M%S).txt"

echo "==================================" | tee -a "$LOG_FILE"
echo "API Routes Rollback Script" | tee -a "$LOG_FILE"
echo "Started at: $(date)" | tee -a "$LOG_FILE"
echo "==================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

cd "$PROJECT_ROOT"

# Find all backup files
BACKUP_FILES=$(find src/app/api -name "*.ts.backup" | sort)
TOTAL_COUNT=$(echo "$BACKUP_FILES" | wc -l | tr -d ' ')

if [ $TOTAL_COUNT -eq 0 ]; then
  echo "No backup files found. Nothing to rollback." | tee -a "$LOG_FILE"
  exit 0
fi

echo "Found $TOTAL_COUNT backup files to restore" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Ask for confirmation
echo "WARNING: This will restore all backed up files and save current refactored versions as .refactored.ts"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled." | tee -a "$LOG_FILE"
  exit 0
fi

ROLLED_BACK_COUNT=0
ERROR_COUNT=0

for BACKUP in $BACKUP_FILES; do
  ORIGINAL="${BACKUP%.backup}"
  REFACTORED="${ORIGINAL%.ts}.refactored.ts"

  echo "Processing: $BACKUP" | tee -a "$LOG_FILE"

  # Check if current version exists
  if [ ! -f "$ORIGINAL" ]; then
    echo "  WARNING: Current file not found: $ORIGINAL" | tee -a "$LOG_FILE"
  else
    # Save current version as refactored
    echo "  Saving current: $ORIGINAL -> $REFACTORED" | tee -a "$LOG_FILE"
    mv "$ORIGINAL" "$REFACTORED"
  fi

  # Restore backup
  echo "  Restoring backup: $BACKUP -> $ORIGINAL" | tee -a "$LOG_FILE"
  mv "$BACKUP" "$ORIGINAL"

  echo "  SUCCESS" | tee -a "$LOG_FILE"
  ROLLED_BACK_COUNT=$((ROLLED_BACK_COUNT + 1))
  echo "" | tee -a "$LOG_FILE"
done

echo "==================================" | tee -a "$LOG_FILE"
echo "Rollback Complete" | tee -a "$LOG_FILE"
echo "Total files: $TOTAL_COUNT" | tee -a "$LOG_FILE"
echo "Rolled back: $ROLLED_BACK_COUNT" | tee -a "$LOG_FILE"
echo "Errors: $ERROR_COUNT" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Finished at: $(date)" | tee -a "$LOG_FILE"
echo "==================================" | tee -a "$LOG_FILE"

if [ $ERROR_COUNT -gt 0 ]; then
  exit 1
fi

exit 0
