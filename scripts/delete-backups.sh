#!/bin/bash

# Backup File Cleanup Script
# Created: 2025-11-03
# Purpose: Delete .backup files after activation is fully tested
#
# SAFETY: Only run this script AFTER:
# 1. All activated components are thoroughly tested
# 2. Application is deployed and running in production
# 3. At least 1 week has passed since activation
# 4. You have confirmed everything works correctly

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Backup File Cleanup Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Find all backup files (excluding node_modules)
BACKUP_FILES=$(find "$PROJECT_ROOT/src" -type f -name "*.backup" 2>/dev/null)
BACKUP_COUNT=$(echo "$BACKUP_FILES" | grep -c . || echo 0)

if [ "$BACKUP_COUNT" -eq 0 ]; then
    echo -e "${GREEN}No backup files found. Cleanup already complete!${NC}"
    exit 0
fi

echo -e "Found ${YELLOW}$BACKUP_COUNT${NC} backup files:"
echo ""
echo "$BACKUP_FILES" | while read -r file; do
    # Get file size
    size=$(ls -lh "$file" | awk '{print $5}')
    # Get relative path from project root
    rel_path="${file#$PROJECT_ROOT/}"
    echo "  - $rel_path ($size)"
done
echo ""

# Safety confirmation
echo -e "${RED}WARNING: This will permanently delete all backup files!${NC}"
echo -e "${YELLOW}Before proceeding, please confirm:${NC}"
echo "  1. All activated components have been thoroughly tested"
echo "  2. Application is running successfully in production"
echo "  3. At least 1 week has passed since activation"
echo "  4. You have a recent database backup"
echo ""

read -p "Are you sure you want to delete these backup files? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${YELLOW}Deletion cancelled. Backup files preserved.${NC}"
    exit 0
fi

# Second confirmation for extra safety
echo ""
read -p "Type 'DELETE BACKUPS' to confirm: " final_confirmation

if [ "$final_confirmation" != "DELETE BACKUPS" ]; then
    echo -e "${YELLOW}Deletion cancelled. Backup files preserved.${NC}"
    exit 0
fi

# Delete backup files
echo ""
echo -e "${YELLOW}Deleting backup files...${NC}"

DELETED_COUNT=0
echo "$BACKUP_FILES" | while read -r file; do
    if [ -f "$file" ]; then
        rel_path="${file#$PROJECT_ROOT/}"
        echo "  Deleting: $rel_path"
        rm "$file"
        ((DELETED_COUNT++)) || true
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Cleanup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Deleted ${GREEN}$BACKUP_COUNT${NC} backup files"
echo ""
echo "To verify, run: find $PROJECT_ROOT/src -type f -name '*.backup'"
echo ""
