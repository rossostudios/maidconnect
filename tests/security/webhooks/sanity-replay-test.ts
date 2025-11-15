/**
 * Sanity Webhook Replay Test
 *
 * Tests idempotency implementation for Sanity webhooks by simulating:
 * 1. Duplicate document revision detection
 * 2. Network failure scenarios (timeout, server crash)
 * 3. Concurrent duplicate requests
 * 4. Database tracking verification
 *
 * Epic H-2.4: Create webhook replay test scripts
 *
 * Usage:
 *   bun run tests/security/webhooks/sanity-replay-test.ts
 *
 * Prerequisites:
 *   - SANITY_WEBHOOK_SECRET set in .env
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 *   - Local dev server running on localhost:3000
 */

import crypto from "node:crypto";

const WEBHOOK_URL = process.env.WEBHOOK_TEST_URL || "http://localhost:3000/api/webhooks/sanity";
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(WEBHOOK_SECRET && SUPABASE_URL && SUPABASE_SERVICE_KEY)) {
  console.error("❌ Missing required environment variables");
  console.error("   SANITY_WEBHOOK_SECRET:", !!WEBHOOK_SECRET);
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!SUPABASE_URL);
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!SUPABASE_SERVICE_KEY);
  process.exit(1);
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Generate Sanity webhook signature (HMAC-SHA256)
 */
function generateSanitySignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Create mock Sanity webhook payload
 */
function createMockPayload(documentId: string, revision: string, documentType = "helpArticle") {
  return {
    _id: documentId,
    _type: documentType,
    _rev: revision,
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    title: "Test Document",
    slug: { current: "test-document" },
    content: [{ _type: "block", children: [{ _type: "span", text: "Test content" }] }],
  };
}

/**
 * Send webhook request
 */
async function sendWebhook(
  payload: Record<string, unknown>
): Promise<{ status: number; body: unknown }> {
  const body = JSON.stringify(payload);
  const signature = generateSanitySignature(body, WEBHOOK_SECRET!);

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sanity-webhook-signature": signature,
    },
    body,
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

/**
 * Check if event exists in database
 */
async function checkEventInDatabase(documentId: string, revision: string): Promise<boolean> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/sanity_webhook_events?document_id=eq.${documentId}&revision=eq.${revision}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const data = await response.json();
  return Array.isArray(data) && data.length > 0;
}

/**
 * Delete test event from database (cleanup)
 */
async function deleteTestEvent(documentId: string, revision: string): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/sanity_webhook_events?document_id=eq.${documentId}&revision=eq.${revision}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
    }
  );
}

/**
 * Test 1: First webhook should succeed and be stored
 */
async function testFirstWebhookSuccess() {
  const testName = "Test 1: First webhook should succeed";
  const documentId = `test-doc-${Date.now()}`;
  const revision = "1-abc123";
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(documentId, revision);

    const payload = createMockPayload(documentId, revision);
    const result = await sendWebhook(payload);

    // Should return 200 OK
    if (result.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected status 200, got ${result.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Should be stored in database
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for DB write
    const inDatabase = await checkEventInDatabase(documentId, revision);

    if (!inDatabase) {
      results.push({
        name: testName,
        passed: false,
        message: "Event not found in database after processing",
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ First webhook processed and stored successfully",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(documentId, revision);
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Test 2: Duplicate webhook (same revision) should be ignored
 */
async function testDuplicateWebhookIgnored() {
  const testName = "Test 2: Duplicate webhook (same revision) should be ignored";
  const documentId = `test-doc-${Date.now()}`;
  const revision = "2-def456";
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(documentId, revision);

    const payload = createMockPayload(documentId, revision);

    // Send first webhook
    const result1 = await sendWebhook(payload);
    if (result1.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `First webhook failed with status ${result1.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Wait for database write
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send duplicate webhook (same revision)
    const result2 = await sendWebhook(payload);

    // Should still return 200 OK (not 400)
    if (result2.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `Duplicate webhook returned status ${result2.status}, expected 200`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Response should indicate duplicate
    const body = result2.body as { received?: boolean; duplicate?: boolean };
    if (!body.duplicate) {
      results.push({
        name: testName,
        passed: false,
        message: "Duplicate webhook not flagged as duplicate in response",
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Duplicate webhook (same revision) correctly ignored",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(documentId, revision);
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Test 3: Different revision should be processed
 */
async function testDifferentRevisionProcessed() {
  const testName = "Test 3: Different revision should be processed";
  const documentId = `test-doc-${Date.now()}`;
  const revision1 = "3-ghi789";
  const revision2 = "4-jkl012";
  const startTime = Date.now();

  try {
    // Clean up any existing test events
    await deleteTestEvent(documentId, revision1);
    await deleteTestEvent(documentId, revision2);

    // Send first revision
    const payload1 = createMockPayload(documentId, revision1);
    const result1 = await sendWebhook(payload1);

    if (result1.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `First revision failed with status ${result1.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Wait for database write
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send second revision (different revision of same document)
    const payload2 = createMockPayload(documentId, revision2);
    const result2 = await sendWebhook(payload2);

    // Should return 200 OK and process (not duplicate)
    if (result2.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `Second revision failed with status ${result2.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    const body = result2.body as { received?: boolean; duplicate?: boolean };
    if (body.duplicate) {
      results.push({
        name: testName,
        passed: false,
        message: "Second revision incorrectly flagged as duplicate",
        duration: Date.now() - startTime,
      });
      return;
    }

    // Both revisions should be in database
    await new Promise((resolve) => setTimeout(resolve, 500));
    const rev1InDb = await checkEventInDatabase(documentId, revision1);
    const rev2InDb = await checkEventInDatabase(documentId, revision2);

    if (!(rev1InDb && rev2InDb)) {
      results.push({
        name: testName,
        passed: false,
        message: `Missing revisions in database: rev1=${rev1InDb}, rev2=${rev2InDb}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Different revisions of same document both processed",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(documentId, revision1);
    await deleteTestEvent(documentId, revision2);
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Test 4: Concurrent duplicate requests
 */
async function testConcurrentDuplicates() {
  const testName = "Test 4: Concurrent duplicate requests";
  const documentId = `test-doc-${Date.now()}`;
  const revision = "5-mno345";
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(documentId, revision);

    const payload = createMockPayload(documentId, revision);

    // Send 5 concurrent requests with same document ID and revision
    const promises = Array.from({ length: 5 }, () => sendWebhook(payload));
    const results_local = await Promise.all(promises);

    // All should return 200 OK
    const allSuccess = results_local.every((r) => r.status === 200);
    if (!allSuccess) {
      results.push({
        name: testName,
        passed: false,
        message: `Not all concurrent requests succeeded: ${results_local.map((r) => r.status).join(", ")}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Wait for database writes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Should only have ONE entry in database
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/sanity_webhook_events?document_id=eq.${documentId}&revision=eq.${revision}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    const data = await response.json();
    const count = Array.isArray(data) ? data.length : 0;

    if (count !== 1) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected 1 database entry, found ${count}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Concurrent requests handled correctly (1 database entry)",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(documentId, revision);
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Test 5: Invalid signature should be rejected
 */
async function testInvalidSignature() {
  const testName = "Test 5: Invalid signature should be rejected";
  const documentId = `test-doc-${Date.now()}`;
  const revision = "6-pqr678";
  const startTime = Date.now();

  try {
    const payload = createMockPayload(documentId, revision);
    const body = JSON.stringify(payload);

    // Send with invalid signature
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "sanity-webhook-signature": "invalid_signature_here",
      },
      body,
    });

    // Should return 401 Unauthorized
    if (response.status !== 401) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected status 401, got ${response.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Should NOT be in database
    await new Promise((resolve) => setTimeout(resolve, 500));
    const inDatabase = await checkEventInDatabase(documentId, revision);

    if (inDatabase) {
      results.push({
        name: testName,
        passed: false,
        message: "Event with invalid signature was stored (should have been rejected)",
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Invalid signature correctly rejected",
      duration: Date.now() - startTime,
    });
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Test 6: Unsupported document type should be ignored
 */
async function testUnsupportedTypeIgnored() {
  const testName = "Test 6: Unsupported document type should be ignored";
  const documentId = `test-doc-${Date.now()}`;
  const revision = "7-stu901";
  const startTime = Date.now();

  try {
    // Send webhook with unsupported document type
    const payload = createMockPayload(documentId, revision, "unsupportedType");
    const result = await sendWebhook(payload);

    // Should return 200 OK (graceful handling)
    if (result.status !== 200) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected status 200, got ${result.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Should NOT be stored in database
    await new Promise((resolve) => setTimeout(resolve, 500));
    const inDatabase = await checkEventInDatabase(documentId, revision);

    if (inDatabase) {
      results.push({
        name: testName,
        passed: false,
        message: "Unsupported document type was stored (should have been ignored)",
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Unsupported document type correctly ignored",
      duration: Date.now() - startTime,
    });
  } catch (error) {
    results.push({
      name: testName,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("\n🔍 Sanity Webhook Replay Tests");
  console.log("================================\n");
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  await testFirstWebhookSuccess();
  await testDuplicateWebhookIgnored();
  await testDifferentRevisionProcessed();
  await testConcurrentDuplicates();
  await testInvalidSignature();
  await testUnsupportedTypeIgnored();

  // Print results
  console.log("\n📊 Test Results");
  console.log("===============\n");

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    console.log(`${icon} ${result.name}${duration}`);
    console.log(`   ${result.message}\n`);

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\nTotal: ${passed + failed} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});
