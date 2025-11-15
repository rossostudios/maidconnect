# Webhook Replay Test Scripts

Automated test scripts for verifying webhook idempotency implementation (Epic H-2.4).

## Overview

These scripts test that webhook handlers correctly:
- Detect and ignore duplicate events
- Store events in database for replay prevention
- Handle concurrent duplicate requests
- Reject invalid signatures
- Validate timestamps (Stripe only)

## Prerequisites

### 1. Environment Variables

Ensure your `.env.local` has:

```bash
# Webhook secrets
STRIPE_WEBHOOK_SECRET=whsec_...
SANITY_WEBHOOK_SECRET=...

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 2. Database Migrations

Apply webhook event tracking migrations:

```bash
supabase db push
```

Tables created:
- `stripe_webhook_events` - Stripe event tracking
- `sanity_webhook_events` - Sanity event tracking

### 3. Development Server

Start the Next.js development server:

```bash
bun dev
```

The scripts expect the webhook endpoints to be available at:
- `http://localhost:3000/api/webhooks/stripe`
- `http://localhost:3000/api/webhooks/sanity`

## Running Tests

### Stripe Webhook Tests

```bash
bun run tests/security/webhooks/stripe-replay-test.ts
```

**Tests:**
1. ✅ First webhook should succeed
2. ✅ Duplicate webhook should be ignored
3. ✅ Old event should be rejected (timestamp validation)
4. ✅ Concurrent duplicate requests (race condition test)
5. ✅ Invalid signature should be rejected

**Expected Output:**
```
🔍 Stripe Webhook Replay Tests
================================

Webhook URL: http://localhost:3000/api/webhooks/stripe
Supabase URL: https://your-project.supabase.co

📊 Test Results
===============

✅ Test 1: First webhook should succeed (523ms)
   ✓ First webhook processed and stored successfully

✅ Test 2: Duplicate webhook should be ignored (612ms)
   ✓ Duplicate webhook correctly ignored with duplicate flag

✅ Test 3: Old event should be rejected (234ms)
   ✓ Old event correctly rejected with 400 status

✅ Test 4: Concurrent duplicate requests (1045ms)
   ✓ Concurrent requests handled correctly (1 database entry)

✅ Test 5: Invalid signature should be rejected (178ms)
   ✓ Invalid signature correctly rejected

Total: 5 tests
Passed: 5
Failed: 0
```

### Sanity Webhook Tests

```bash
bun run tests/security/webhooks/sanity-replay-test.ts
```

**Tests:**
1. ✅ First webhook should succeed
2. ✅ Duplicate webhook (same revision) should be ignored
3. ✅ Different revision should be processed
4. ✅ Concurrent duplicate requests (race condition test)
5. ✅ Invalid signature should be rejected
6. ✅ Unsupported document type should be ignored

**Expected Output:**
```
🔍 Sanity Webhook Replay Tests
================================

Webhook URL: http://localhost:3000/api/webhooks/sanity
Supabase URL: https://your-project.supabase.co

📊 Test Results
===============

✅ Test 1: First webhook should succeed (456ms)
   ✓ First webhook processed and stored successfully

✅ Test 2: Duplicate webhook (same revision) should be ignored (578ms)
   ✓ Duplicate webhook (same revision) correctly ignored

✅ Test 3: Different revision should be processed (934ms)
   ✓ Different revisions of same document both processed

✅ Test 4: Concurrent duplicate requests (1123ms)
   ✓ Concurrent requests handled correctly (1 database entry)

✅ Test 5: Invalid signature should be rejected (189ms)
   ✓ Invalid signature correctly rejected

✅ Test 6: Unsupported document type should be ignored (234ms)
   ✓ Unsupported document type correctly ignored

Total: 6 tests
Passed: 6
Failed: 0
```

### Run Both Test Suites

```bash
# Run Stripe tests
bun run tests/security/webhooks/stripe-replay-test.ts

# Run Sanity tests
bun run tests/security/webhooks/sanity-replay-test.ts
```

Or create a convenience script in `package.json`:

```json
{
  "scripts": {
    "test:webhooks": "bun run tests/security/webhooks/stripe-replay-test.ts && bun run tests/security/webhooks/sanity-replay-test.ts"
  }
}
```

Then run:

```bash
bun run test:webhooks
```

## Testing Against Production

⚠️ **WARNING:** Do NOT run these tests against production webhooks.

To test staging/preview deployments, set `WEBHOOK_TEST_URL`:

```bash
# Test against Vercel preview deployment
WEBHOOK_TEST_URL=https://your-preview.vercel.app/api/webhooks/stripe \
  bun run tests/security/webhooks/stripe-replay-test.ts
```

## Understanding Test Results

### ✅ All Tests Pass

Webhook idempotency is working correctly:
- Duplicate events are detected and ignored
- Events are stored in database
- Race conditions are handled
- Invalid signatures are rejected

**Action:** Deploy to production with confidence.

### ❌ Test Failures

**Common Failures:**

1. **"Event not found in database after processing"**
   - Cause: Idempotency storage not implemented or failing
   - Fix: Check database migration applied, verify Supabase client permissions

2. **"Duplicate webhook not flagged as duplicate"**
   - Cause: Idempotency check not working
   - Fix: Verify database query logic, check unique constraints

3. **"Expected 1 database entry, found 2+"**
   - Cause: Race condition - concurrent requests creating duplicate entries
   - Fix: Add database-level unique constraints, use transactions

4. **"Expected status 400, got 200" (old event test)**
   - Cause: Timestamp validation not implemented
   - Fix: Add timestamp check before processing

5. **Connection refused / Fetch failed**
   - Cause: Development server not running
   - Fix: Start `bun dev` in another terminal

## Manual Testing

### Test Duplicate Stripe Webhook

```bash
# 1. Send first webhook
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=$(echo -n '1234567890.{"id":"evt_test_123","type":"payment_intent.succeeded"}' | openssl dgst -sha256 -hmac "$STRIPE_WEBHOOK_SECRET" | cut -d' ' -f2)" \
  -d '{"id":"evt_test_123","type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}'

# 2. Send same event again (should be ignored)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=$(echo -n '1234567890.{"id":"evt_test_123","type":"payment_intent.succeeded"}' | openssl dgst -sha256 -hmac "$STRIPE_WEBHOOK_SECRET" | cut -d' ' -f2)" \
  -d '{"id":"evt_test_123","type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}'

# Expected response for duplicate:
# {"received":true,"duplicate":true}
```

### Test Duplicate Sanity Webhook

```bash
# 1. Generate signature
PAYLOAD='{"_id":"test-doc-123","_type":"helpArticle","_rev":"1-abc123","title":"Test"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SANITY_WEBHOOK_SECRET" | cut -d' ' -f2)

# 2. Send first webhook
curl -X POST http://localhost:3000/api/webhooks/sanity \
  -H "Content-Type: application/json" \
  -H "sanity-webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"

# 3. Send same event again (should be ignored)
curl -X POST http://localhost:3000/api/webhooks/sanity \
  -H "Content-Type: application/json" \
  -H "sanity-webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"

# Expected response for duplicate:
# {"received":true,"duplicate":true}
```

## Database Verification

Check events stored in database:

```sql
-- Check Stripe events
SELECT event_id, event_type, processed_at
FROM stripe_webhook_events
ORDER BY processed_at DESC
LIMIT 10;

-- Check Sanity events
SELECT document_id, document_type, revision, action, processed_at
FROM sanity_webhook_events
ORDER BY processed_at DESC
LIMIT 10;

-- Check for duplicates (should return 0 rows)
SELECT event_id, COUNT(*) as count
FROM stripe_webhook_events
GROUP BY event_id
HAVING COUNT(*) > 1;

SELECT document_id, revision, COUNT(*) as count
FROM sanity_webhook_events
GROUP BY document_id, revision
HAVING COUNT(*) > 1;
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  webhook-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Apply migrations
        run: supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres

      - name: Start dev server
        run: bun dev &
        env:
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
          SANITY_WEBHOOK_SECRET: ${{ secrets.SANITY_WEBHOOK_SECRET }}

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Stripe webhook tests
        run: bun run tests/security/webhooks/stripe-replay-test.ts

      - name: Run Sanity webhook tests
        run: bun run tests/security/webhooks/sanity-replay-test.ts
```

## Troubleshooting

### Tests Hang or Timeout

**Cause:** Development server not responding, database connection issues

**Fix:**
```bash
# Check server is running
curl http://localhost:3000/api/webhooks/stripe
# Should return 405 Method Not Allowed (GET not supported)

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"
```

### "Invalid signature" on Valid Requests

**Cause:** Webhook secret mismatch between test and environment

**Fix:**
```bash
# Verify secrets match
echo $STRIPE_WEBHOOK_SECRET
echo $SANITY_WEBHOOK_SECRET

# Regenerate test signatures with correct secret
```

### Database "Permission Denied"

**Cause:** Using anon key instead of service role key

**Fix:**
```bash
# Ensure using service role key
echo $SUPABASE_SERVICE_ROLE_KEY | head -c 20
# Should start with: eyJhbGciOiJIUzI1NiI...
```

## Related Documentation

- [H-2.1: Stripe Webhook Audit](../../../docs/security/h2-1-stripe-webhook-audit.md)
- [H-2.2: Sanity Webhook Audit](../../../docs/security/h2-2-sanity-webhook-audit.md)
- [H-2.3: Idempotency Implementation](../../../docs/security/h2-3-webhook-idempotency-implementation.md)
- [Stripe Webhook Handler](../../../src/app/api/webhooks/stripe/route.ts)
- [Sanity Webhook Handler](../../../src/app/api/webhooks/sanity/route.ts)

---

**Epic:** H-2 - Webhook Security Audit
**Phase:** H-2.4 - Create Webhook Replay Test Scripts
**Status:** ✅ Complete
