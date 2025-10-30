#!/bin/bash

# Revert Next.js 16 params Promise changes back to Next.js 15 sync params

find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Check if file contains "params: Promise<"
  if grep -q "params: Promise<" "$file"; then
    echo "Fixing: $file"

    # Create temporary file
    temp_file=$(mktemp)

    # Read file and apply replacements
    awk '
    {
      # Replace Promise<{ locale: string }> with { locale: string }
      gsub(/params: Promise<\{ locale: string \}>/, "params: { locale: string }")

      # Replace Promise<{ id: string; locale: string }> with { id: string; locale: string }
      gsub(/params: Promise<\{ id: string; locale: string \}>/, "params: { id: string; locale: string }")

      # Replace Promise<{ locale: string; id: string }> with { locale: string; id: string }
      gsub(/params: Promise<\{ locale: string; id: string \}>/, "params: { locale: string; id: string }")

      # Replace "await params" with "params" (remove await)
      gsub(/const \{ ([^}]+) \} = await params;/, "const { \\1 } = params;")

      print
    }
    ' "$file" > "$temp_file"

    # Replace original file
    mv "$temp_file" "$file"
  fi
done

echo "Done! Reverted params Promise changes in all files."
