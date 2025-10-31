#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

/**
 * Fix duplicate "pages" keys in translation JSON files
 * Merges both occurrences into a single valid "pages" object
 */

const PAGES_OBJECT_REGEX = /"pages":\s*(\{[\s\S]*\})/;

function fixTranslationFile(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);

  // Read the file as text to manually parse and merge
  const content = fs.readFileSync(filePath, "utf8");

  // Find all "pages" key occurrences
  const pagesPattern = /^\s*"pages":\s*\{/gm;
  const matches = [...content.matchAll(pagesPattern)];

  console.log(`Found ${matches.length} "pages" key(s)`);

  if (matches.length !== 2) {
    console.log(`⚠️  Expected 2 "pages" keys, found ${matches.length}. Skipping...`);
    return false;
  }

  // Parse the JSON (this will only keep the LAST "pages" object due to duplicate key)
  const jsonData = JSON.parse(content);

  // Now we need to extract the FIRST "pages" object manually from the text
  // Find the first "pages" occurrence and extract its content
  const firstPagesStart = matches[0].index;

  // Find the closing brace for the first "pages" object
  let braceCount = 0;
  let firstPagesEnd = firstPagesStart;
  let foundOpen = false;

  for (let i = firstPagesStart; i < content.length; i++) {
    if (content[i] === "{") {
      braceCount++;
      foundOpen = true;
    } else if (content[i] === "}") {
      braceCount--;
      if (foundOpen && braceCount === 0) {
        firstPagesEnd = i + 1;
        break;
      }
    }
  }

  // Extract the first "pages" section text
  const firstPagesText = content.substring(firstPagesStart, firstPagesEnd);

  // Parse just the object part (remove the key)
  const firstPagesMatch = firstPagesText.match(PAGES_OBJECT_REGEX);
  if (!firstPagesMatch) {
    console.log('❌ Could not parse first "pages" object');
    return false;
  }

  const firstPagesObject = JSON.parse(firstPagesMatch[1]);

  // The second "pages" is already in jsonData.pages
  const secondPagesObject = jsonData.pages;

  console.log(`First "pages" has ${Object.keys(firstPagesObject).length} keys`);
  console.log(`Second "pages" has ${Object.keys(secondPagesObject).length} keys`);

  // Merge: first object keys + second object keys (second overwrites if there's a conflict)
  const mergedPages = {
    ...firstPagesObject,
    ...secondPagesObject,
  };

  console.log(`Merged "pages" has ${Object.keys(mergedPages).length} keys`);

  // Create the corrected JSON structure
  // We need to preserve the original order of top-level keys
  const correctedData = {};

  // Parse again to get the original key order
  const keyOrder = [];
  const topLevelKeyPattern = /^\s*"([^"]+)":/gm;
  let keyMatch;
  while ((keyMatch = topLevelKeyPattern.exec(content)) !== null) {
    const key = keyMatch[1];
    if (!keyOrder.includes(key)) {
      keyOrder.push(key);
    }
  }

  // Build corrected object with original key order
  for (const key of keyOrder) {
    if (key === "pages") {
      // Use merged pages only once
      if (!correctedData.pages) {
        correctedData.pages = mergedPages;
      }
    } else {
      correctedData[key] = jsonData[key];
    }
  }

  // Write the corrected JSON back
  const correctedJson = `${JSON.stringify(correctedData, null, 2)}\n`;
  fs.writeFileSync(filePath, correctedJson, "utf8");

  console.log("✅ Fixed successfully!");

  // Verify the fix
  const verifyContent = fs.readFileSync(filePath, "utf8");
  const verifyMatches = [...verifyContent.matchAll(pagesPattern)];

  if (verifyMatches.length === 1) {
    console.log('✅ Verification passed: Only 1 "pages" key found');

    // Verify it's valid JSON
    try {
      const parsed = JSON.parse(verifyContent);
      console.log(`✅ Valid JSON with ${Object.keys(parsed.pages).length} page keys`);
      return true;
    } catch (e) {
      console.log("❌ Invalid JSON after fix:", e.message);
      return false;
    }
  } else {
    console.log(`❌ Verification failed: Found ${verifyMatches.length} "pages" keys`);
    return false;
  }
}

// Process both translation files
const messagesDir = path.join(__dirname, "..", "messages");
const enFile = path.join(messagesDir, "en.json");
const esFile = path.join(messagesDir, "es.json");

console.log('🔧 Fixing duplicate "pages" keys in translation files...\n');

let success = true;

if (fs.existsSync(enFile)) {
  success = fixTranslationFile(enFile) && success;
} else {
  console.log(`⚠️  File not found: ${enFile}`);
  success = false;
}

if (fs.existsSync(esFile)) {
  success = fixTranslationFile(esFile) && success;
} else {
  console.log(`⚠️  File not found: ${esFile}`);
  success = false;
}

if (success) {
  console.log("\n✅ All translation files fixed successfully!");
  process.exit(0);
} else {
  console.log("\n❌ Some files failed to fix");
  process.exit(1);
}
