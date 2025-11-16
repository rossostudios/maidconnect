# Security Tests

This directory contains security-focused tests for Casaora, including rate limiting, webhook verification, and other security mechanisms.

## Rate Limit Load Testing

**File:** `rate-limit-load-test.ts`

Comprehensive load testing for all rate limit tiers to ensure proper functioning under concurrent requests.

### Prerequisites

1. **Development server running:**
   ```bash
   bun dev
   ```

2. **Server accessible at:** `http://localhost:3000` (or set `TEST_BASE_URL` env var)

### Running the Tests

```bash
# Run rate limit load tests
bun run tests/security/rate-limit-load-test.ts

# Or with custom base URL
TEST_BASE_URL=http://localhost:3001 bun run tests/security/rate-limit-load-test.ts
```

### What It Tests

1. **API Tier Rate Limiting (100 req/min)**
   - Sends 105 requests rapidly to trigger rate limit
   - Verifies correct 429 responses after limit exceeded
   - Checks rate limit headers (X-RateLimit-*)

2. **Rate Limit Reset Behavior**
   - Waits for rate limit window to expire
   - Verifies requests succeed after reset

3. **Concurrent Request Handling**
   - Sends batches of requests concurrently
   - Ensures rate limiting works correctly under load

4. **Rate Limit Rejection Logging**
   - Triggers rate limit to generate logs
   - Verifies `[RATE_LIMIT_REJECTED]` logs appear in server console

### Expected Output

```
============================================================
Rate Limit Load Testing
============================================================

[TEST] Testing against: http://localhost:3000
[TEST] Timeout: 120000ms
✓ Server is running

============================================================
Test 1: API Tier Rate Limiting (100 req/min)
============================================================

[TEST] Sending 105 requests to /api/search...
[TEST] Results: 100 succeeded, 5 rate-limited
[TEST]   API Tier - Status: 429
[TEST]   Limit: 100, Remaining: 0
[TEST]   Reset: 2025-01-14T12:01:00.000Z
[TEST]   Retry-After: 45s
✓ API: Successful requests <= 100
✓ API: Some requests should be rate-limited
✓ API tier rate limiting works correctly

============================================================
Test Summary
============================================================

Total Tests: 12
Passed: 12
Failed: 0
Pass Rate: 100.0%

✓ All tests passed!
```

### Rate Limit Tiers Tested

| Tier | Max Requests | Window | Endpoint Tested |
|------|--------------|--------|-----------------|
| API | 100 | 1 minute | `/api/search` |
| Admin* | 10 | 1 minute | *Requires auth* |
| Payment* | 15 | 1 minute | *Requires auth* |
| Financial* | 1 | 1 minute | *Requires auth* |
| Dispute* | 3 | 1 hour | *Requires auth* |
| Cron* | 1 | 5 minutes | *Internal only* |

*Note: Some tiers require authentication and are not tested in the current script. Future enhancements can add authenticated endpoint testing.*

### Verifying Logs

When the test runs, check your **server console** (where `bun dev` is running) for logs like:

```
[RATE_LIMIT_REJECTED] {
  timestamp: "2025-01-14T12:00:30.000Z",
  ip: "::1",
  path: "/api/search",
  method: "GET",
  rateLimitType: "api",
  tier: { maxRequests: 100, windowMs: 60000, windowMinutes: 1 },
  current: { remaining: 0, limit: 100, reset: "...", retryAfter: 45 },
  userAgent: "node"
}
```

### Troubleshooting

**Server not running:**
```
✗ Server not running at http://localhost:3000
✗ Start the development server with: bun dev
```
→ Start dev server with `bun dev`

**Connection refused:**
```
✗ Fatal error: Error: fetch failed
```
→ Check if port 3000 is available or set `TEST_BASE_URL` to correct port

**Tests timing out:**
```
✗ Fatal error: Error: Test suite timeout
```
→ Increase `TEST_TIMEOUT` in the script or check server performance

### Rate Limit Configuration

Rate limits are configured in [`src/lib/rate-limit.ts`](../../src/lib/rate-limit.ts):

```typescript
export const RateLimiters = {
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "API rate limit exceeded. Please slow down your requests.",
  },
  admin: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many admin requests. Please slow down.",
  },
  // ... more tiers
};
```

### CI/CD Integration

To run in CI/CD pipelines:

```yaml
# .github/workflows/security-tests.yml
- name: Start dev server
  run: bun dev &

- name: Wait for server
  run: sleep 5

- name: Run rate limit tests
  run: bun run tests/security/rate-limit-load-test.ts
```

## Webhook Security Tests

**Directory:** `webhooks/`

Contains tests for webhook signature verification:
- Stripe webhook signature validation
- Sanity webhook signature validation
- Replay attack prevention

See [`webhooks/README.md`](./webhooks/README.md) for details.

## Future Enhancements

- [ ] Add authenticated endpoint testing (admin, payment, etc.)
- [ ] Add Upstash Redis integration tests
- [ ] Add rate limit analytics verification
- [ ] Add distributed rate limiting tests across multiple instances
- [ ] Add rate limit bypass testing (IP allowlisting)
- [ ] Performance benchmarking for rate limit middleware overhead

## Related Resources

- [Rate Limit Implementation](../../src/lib/rate-limit.ts)
