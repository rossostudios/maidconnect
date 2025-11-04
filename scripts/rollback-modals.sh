#!/bin/bash

# Rollback script for modal component replacements
# This script restores all original modal files from their .backup versions
# Created: 2025-11-03

set -e

echo "=========================================="
echo "Modal Rollback Script"
echo "=========================================="
echo ""
echo "This script will restore all original modal files from backups."
echo "WARNING: This will overwrite the current refactored versions!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Rollback cancelled."
    exit 0
fi

BASE_DIR="/Users/christopher/Desktop/casaora/maidconnect/src/components"

# Counter for tracking
RESTORED=0
FAILED=0

# Function to restore a modal
restore_modal() {
    local backup_file="$1"
    local original_file="${backup_file%.backup}"

    if [ -f "$backup_file" ]; then
        echo "Restoring: $(basename $original_file)"
        cp "$backup_file" "$original_file"
        if [ $? -eq 0 ]; then
            ((RESTORED++))
            echo "  ✓ Successfully restored"
        else
            ((FAILED++))
            echo "  ✗ Failed to restore"
        fi
    else
        echo "Warning: Backup file not found: $backup_file"
        ((FAILED++))
    fi
    echo ""
}

echo "Starting rollback process..."
echo ""

# Restore bookings modals
echo "--- Restoring Bookings Modals ---"
restore_modal "$BASE_DIR/bookings/cancel-booking-modal.tsx.backup"
restore_modal "$BASE_DIR/bookings/dispute-modal.tsx.backup"
restore_modal "$BASE_DIR/bookings/time-extension-modal.tsx.backup"
restore_modal "$BASE_DIR/bookings/reschedule-booking-modal.tsx.backup"
restore_modal "$BASE_DIR/bookings/rebook-modal.tsx.backup"

# Restore admin modals
echo "--- Restoring Admin Modals ---"
restore_modal "$BASE_DIR/admin/professional-review-modal.tsx.backup"

# Restore feedback modals
echo "--- Restoring Feedback Modals ---"
restore_modal "$BASE_DIR/feedback/feedback-modal.tsx.backup"

# Restore changelog modals
echo "--- Restoring Changelog Modals ---"
restore_modal "$BASE_DIR/changelog/changelog-modal.tsx.backup"

# Restore review modals
echo "--- Restoring Review Modals ---"
restore_modal "$BASE_DIR/reviews/rating-prompt-modal.tsx.backup"

echo "=========================================="
echo "Rollback Summary"
echo "=========================================="
echo "Successfully restored: $RESTORED files"
echo "Failed to restore: $FAILED files"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "All modals have been successfully rolled back!"
    echo ""
    echo "Next steps:"
    echo "1. Review the restored files"
    echo "2. If satisfied, you can delete the .backup files"
    echo "3. Run tests to verify functionality"
else
    echo "Some files failed to restore. Please check the errors above."
    exit 1
fi
