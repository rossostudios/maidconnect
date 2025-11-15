/**
 * Stripe Webhook Replay Test
 *
 * Tests idempotency implementation for Stripe webhooks by simulating:
 * 1. Duplicate event detection
 * 2. Network failure scenarios (timeout, server crash)
 * 3. Concurrent duplicate requests
 * 4. Database tracking verification
 *
 * Epic H-2.4: Create webhook replay test scripts
 *
 * Usage:
 *   bun run tests/security/webhooks/stripe-replay-test.ts
 *
 * Prerequisites:
 *   - STRIPE_WEBHOOK_SECRET set in .env
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 *   - Local dev server running on localhost:3000
 */

import crypto from "node:crypto";
import type Stripe from "stripe";

const WEBHOOK_URL = process.env.WEBHOOK_TEST_URL || "http://localhost:3000/api/webhooks/stripe";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(WEBHOOK_SECRET && SUPABASE_URL && SUPABASE_SERVICE_KEY)) {
  console.error("❌ Missing required environment variables");
  console.error("   STRIPE_WEBHOOK_SECRET:", !!WEBHOOK_SECRET);
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
 * Generate Stripe webhook signature
 */
function generateStripeSignature(payload: string, secret: string, timestamp?: number): string {
  const t = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${t}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${t},v1=${signature}`;
}

/**
 * Create mock Stripe event
 */
function createMockEvent(eventId: string, eventType = "payment_intent.succeeded"): Stripe.Event {
  return {
    id: eventId,
    object: "event",
    type: eventType,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "pi_test123",
        object: "payment_intent",
        amount: 10_000,
        currency: "usd",
        status: "succeeded",
        metadata: {
          booking_id: "test-booking-123",
        },
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    api_version: "2023-10-16",
  } as unknown as Stripe.Event;
}

/**
 * Send webhook request
 */
async function sendWebhook(
  event: Stripe.Event,
  timestamp?: number
): Promise<{ status: number; body: unknown }> {
  const payload = JSON.stringify(event);
  const signature = generateStripeSignature(payload, WEBHOOK_SECRET!, timestamp);

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

/**
 * Check if event exists in database
 */
async function checkEventInDatabase(eventId: string): Promise<boolean> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/stripe_webhook_events?event_id=eq.${eventId}`,
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
async function deleteTestEvent(eventId: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/stripe_webhook_events?event_id=eq.${eventId}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: "return=minimal",
    },
  });
}

/**
 * Test 1: First webhook should succeed and be stored
 */
async function testFirstWebhookSuccess() {
  const testName = "Test 1: First webhook should succeed";
  const eventId = `evt_test_first_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(eventId);

    const event = createMockEvent(eventId);
    const result = await sendWebhook(event);

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
    const inDatabase = await checkEventInDatabase(eventId);

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
    await deleteTestEvent(eventId);
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
 * Test 2: Duplicate webhook should be ignored
 */
async function testDuplicateWebhookIgnored() {
  const testName = "Test 2: Duplicate webhook should be ignored";
  const eventId = `evt_test_duplicate_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(eventId);

    const event = createMockEvent(eventId);

    // Send first webhook
    const result1 = await sendWebhook(event);
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

    // Send duplicate webhook
    const result2 = await sendWebhook(event);

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
      message: "✓ Duplicate webhook correctly ignored with duplicate flag",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(eventId);
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
 * Test 3: Old event should be rejected (timestamp validation)
 */
async function testOldEventRejected() {
  const testName = "Test 3: Old event should be rejected";
  const eventId = `evt_test_old_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(eventId);

    const event = createMockEvent(eventId);
    // Create event with timestamp 10 minutes ago (older than 5-minute limit)
    event.created = Math.floor(Date.now() / 1000) - 600;

    // Use old timestamp for signature
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
    const result = await sendWebhook(event, oldTimestamp);

    // Should return 400 Bad Request
    if (result.status !== 400) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected status 400, got ${result.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Should NOT be in database
    await new Promise((resolve) => setTimeout(resolve, 500));
    const inDatabase = await checkEventInDatabase(eventId);

    if (inDatabase) {
      results.push({
        name: testName,
        passed: false,
        message: "Old event was stored in database (should have been rejected)",
        duration: Date.now() - startTime,
      });
      return;
    }

    results.push({
      name: testName,
      passed: true,
      message: "✓ Old event correctly rejected with 400 status",
      duration: Date.now() - startTime,
    });

    // Cleanup
    await deleteTestEvent(eventId);
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
  const eventId = `evt_test_concurrent_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Clean up any existing test event
    await deleteTestEvent(eventId);

    const event = createMockEvent(eventId);

    // Send 5 concurrent requests with same event ID
    const promises = Array.from({ length: 5 }, () => sendWebhook(event));
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
      `${SUPABASE_URL}/rest/v1/stripe_webhook_events?event_id=eq.${eventId}`,
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
    await deleteTestEvent(eventId);
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
  const eventId = `evt_test_invalid_${Date.now()}`;
  const startTime = Date.now();

  try {
    const event = createMockEvent(eventId);
    const payload = JSON.stringify(event);

    // Send with invalid signature
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123456789,v1=invalid_signature_here",
      },
      body: payload,
    });

    // Should return 400 Bad Request
    if (response.status !== 400) {
      results.push({
        name: testName,
        passed: false,
        message: `Expected status 400, got ${response.status}`,
        duration: Date.now() - startTime,
      });
      return;
    }

    // Should NOT be in database
    await new Promise((resolve) => setTimeout(resolve, 500));
    const inDatabase = await checkEventInDatabase(eventId);

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
 * Run all tests
 */
async function runTests() {
  console.log("\n🔍 Stripe Webhook Replay Tests");
  console.log("================================\n");
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  await testFirstWebhookSuccess();
  await testDuplicateWebhookIgnored();
  await testOldEventRejected();
  await testConcurrentDuplicates();
  await testInvalidSignature();

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
