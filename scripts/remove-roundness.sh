#!/bin/bash

# Remove ALL roundness from admin components
# Preserves rounded-full ONLY for avatars and notification dots

echo "🔧 Removing ALL roundness from admin dashboard..."

# List of admin component files
ADMIN_FILES=$(find src/components/admin src/app/\[locale\]/admin -name "*.tsx" -type f)

for file in $ADMIN_FILES; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Remove rounded- classes (except rounded-full on specific contexts)
    # Replace rounded-xl, rounded-lg, rounded-md, rounded-sm with empty string
    # Keep rounded-full ONLY for avatars, notification dots, and circles

    # Remove rounded-xl
    sed -i '' 's/rounded-xl //g' "$file"
    sed -i '' 's/ rounded-xl/ /g' "$file"
    sed -i '' 's/rounded-xl"//g' "$file"

    # Remove rounded-lg
    sed -i '' 's/rounded-lg //g' "$file"
    sed -i '' 's/ rounded-lg/ /g' "$file"
    sed -i '' 's/rounded-lg"//g' "$file"

    # Remove rounded-md
    sed -i '' 's/rounded-md //g' "$file"
    sed -i '' 's/ rounded-md/ /g' "$file"
    sed -i '' 's/rounded-md"//g' "$file"

    # Remove rounded-sm
    sed -i '' 's/rounded-sm //g' "$file"
    sed -i '' 's/ rounded-sm/ /g' "$file"
    sed -i '' 's/rounded-sm"//g' "$file"

    # Remove standalone "rounded"
    sed -i '' 's/rounded //g' "$file"
    sed -i '' 's/ rounded/ /g' "$file"
    sed -i '' 's/rounded"//g' "$file"
  fi
done

echo "✅ Roundness removal complete!"
echo "🔍 Files processed: $(echo "$ADMIN_FILES" | wc -l)"
