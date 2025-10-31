#!/usr/bin/env node

/**
 * Test that translation files can be loaded and used properly
 */

console.log("🧪 Testing translation file loading...\n");

try {
  // Test loading
  const en = require("../messages/en.json");
  const es = require("../messages/es.json");

  console.log("✅ Both files loaded successfully");

  // Test accessing product pages
  const productPages = [
    "bookingPlatform",
    "professionalProfiles",
    "paymentProcessing",
    "secureMessaging",
    "reviewsRatings",
    "adminDashboard",
  ];

  console.log("\n📦 Testing product page access:");
  let productPagesOk = true;
  for (const page of productPages) {
    const enExists = !!en.pages[page];
    const esExists = !!es.pages[page];
    const status = enExists && esExists ? "✅" : "❌";
    console.log(`  ${status} ${page}: EN=${enExists}, ES=${esExists}`);
    if (!(enExists && esExists)) {
      productPagesOk = false;
    }
  }

  // Test accessing static pages
  const staticPages = ["contact", "signIn", "signUp", "terms", "privacy", "professionalProfile"];

  console.log("\n📄 Testing static page access:");
  let staticPagesOk = true;
  for (const page of staticPages) {
    const enExists = !!en.pages[page];
    const esExists = !!es.pages[page];
    const status = enExists && esExists ? "✅" : "❌";
    console.log(`  ${status} ${page}: EN=${enExists}, ES=${esExists}`);
    if (!(enExists && esExists)) {
      staticPagesOk = false;
    }
  }

  // Test sample deep access
  console.log("\n🔍 Testing deep property access:");

  const tests = [
    {
      path: "pages.bookingPlatform.hero.headline",
      en: en.pages?.bookingPlatform?.hero?.headline,
      es: es.pages?.bookingPlatform?.hero?.headline,
    },
    {
      path: "pages.contact.hero.title",
      en: en.pages?.contact?.hero?.title,
      es: es.pages?.contact?.hero?.title,
    },
    {
      path: "pages.signIn.form.emailLabel",
      en: en.pages?.signIn?.form?.emailLabel,
      es: es.pages?.signIn?.form?.emailLabel,
    },
  ];

  let deepAccessOk = true;
  for (const test of tests) {
    const enOk = typeof test.en === "string" && test.en.length > 0;
    const esOk = typeof test.es === "string" && test.es.length > 0;
    const status = enOk && esOk ? "✅" : "❌";
    console.log(`  ${status} ${test.path}`);
    if (enOk) {
      console.log(`      EN: "${test.en.substring(0, 50)}${test.en.length > 50 ? "..." : ""}"`);
    }
    if (esOk) {
      console.log(`      ES: "${test.es.substring(0, 50)}${test.es.length > 50 ? "..." : ""}"`);
    }
    if (!(enOk && esOk)) {
      deepAccessOk = false;
    }
  }

  // Final summary
  console.log(`\n${"=".repeat(60)}`);
  if (productPagesOk && staticPagesOk && deepAccessOk) {
    console.log("✅ ALL TESTS PASSED");
    console.log("   Translation files are valid and fully functional!");
    process.exit(0);
  } else {
    console.log("❌ SOME TESTS FAILED");
    console.log("   Product pages OK:", productPagesOk);
    console.log("   Static pages OK:", staticPagesOk);
    console.log("   Deep access OK:", deepAccessOk);
    process.exit(1);
  }
} catch (error) {
  console.error("❌ ERROR:", error.message);
  console.error(error.stack);
  process.exit(1);
}
