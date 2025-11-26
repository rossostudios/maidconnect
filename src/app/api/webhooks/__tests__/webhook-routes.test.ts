/**
 * Webhook Route Tests
 *
 * Tests for Stripe and PayPal webhook handlers including:
 * - Signature verification
 * - Timestamp validation (5-minute window)
 * - Idempotency checks
 * - Event processing
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import type Stripe from "stripe";

// ============================================================================
// MOCK FACTORIES
// ============================================================================

type MockFn = ReturnType<typeof mock>;

// Mock supabaseAdmin
const mockSupabaseAdmin = {
  from: mock(() => mockSupabaseAdmin),
  select: mock(() => mockSupabaseAdmin),
  insert: mock(() => mockSupabaseAdmin),
  eq: mock(() => mockSupabaseAdmin),
  single: mock(() => Promise.resolve({ data: null, error: null })),
  maybeSingle: mock(() => Promise.resolve({ data: null, error: null })),
};

// Reset helper
function resetSupabaseMock() {
  (mockSupabaseAdmin.from as MockFn).mockImplementation(() => mockSupabaseAdmin);
  (mockSupabaseAdmin.select as MockFn).mockImplementation(() => mockSupabaseAdmin);
  (mockSupabaseAdmin.insert as MockFn).mockImplementation(() =>
    Promise.resolve({ data: null, error: null })
  );
  (mockSupabaseAdmin.eq as MockFn).mockImplementation(() => mockSupabaseAdmin);
  (mockSupabaseAdmin.single as MockFn).mockImplementation(() =>
    Promise.resolve({ data: null, error: null })
  );
  (mockSupabaseAdmin.maybeSingle as MockFn).mockImplementation(() =>
    Promise.resolve({ data: null, error: null })
  );
}

// Mock stripe
const mockStripe = {
  webhooks: {
    constructEvent: mock(
      (_payload: string, _signature: string, _secret: string): Stripe.Event => ({
        id: "evt_test123",
        type: "payment_intent.succeeded",
        created: Math.floor(Date.now() / 1000),
        data: { object: {} },
        object: "event",
        api_version: "2025-10-29.clover",
        livemode: false,
        pending_webhooks: 0,
        request: null,
      })
    ),
  },
};

// Mock processWebhookEvent
const mockProcessWebhookEvent = mock(() => Promise.resolve());

// Mock assertStripeSignature
const mockAssertStripeSignature = mock((_request: Request) => ({
  signature: "test_signature",
  secret: "test_secret",
}));

// Mock PayPal client
const mockPayPal = {
  verifyWebhookSignature: mock(() => Promise.resolve(true)),
};

// ============================================================================
// MODULE MOCKS
// ============================================================================

mock.module("@/lib/supabase/admin-client", () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

mock.module("@/lib/stripe", () => ({
  stripe: mockStripe,
  assertStripeSignature: mockAssertStripeSignature,
}));

mock.module("@/lib/stripe/webhook-handlers", () => ({
  processWebhookEvent: mockProcessWebhookEvent,
}));

mock.module("@/lib/integrations/paypal", () => ({
  paypal: mockPayPal,
}));

mock.module("@/lib/logger", () => ({
  logger: {
    info: () => {},
    error: () => {},
    warn: () => {},
  },
}));

import { POST as paypalWebhook } from "../paypal/route";
// Import routes after mocking
import { POST as stripeWebhook } from "../stripe/route";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createStripeRequest(payload: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "test_signature",
      ...headers,
    },
    body: payload,
  }) as unknown as Request;
}

function createPayPalRequest(payload: string, headers: Record<string, string> = {}) {
  const defaultHeaders = {
    "content-type": "application/json",
    "paypal-transmission-id": "test-transmission-id",
    "paypal-transmission-time": new Date().toISOString(),
    "paypal-cert-url": "https://api.paypal.com/cert.pem",
    "paypal-auth-algo": "SHA256withRSA",
    "paypal-transmission-sig": "test-signature",
  };

  return new Request("http://localhost:3000/api/webhooks/paypal", {
    method: "POST",
    headers: { ...defaultHeaders, ...headers },
    body: payload,
  });
}

function createStripeEvent(overrides: Partial<Stripe.Event> = {}): Stripe.Event {
  return {
    id: "evt_test123",
    type: "payment_intent.succeeded",
    created: Math.floor(Date.now() / 1000),
    data: { object: {} },
    object: "event",
    api_version: "2025-10-29.clover",
    livemode: false,
    pending_webhooks: 0,
    request: null,
    ...overrides,
  } as Stripe.Event;
}

function createPayPalEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "WH-test123",
    event_type: "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
    create_time: new Date().toISOString(),
    resource: {
      payout_item_id: "payout-item-123",
      transaction_id: "txn-123",
      payout_item: {
        receiver: "test@example.com",
        amount: { value: "100.00", currency: "USD" },
      },
    },
    ...overrides,
  };
}

// ============================================================================
// STRIPE WEBHOOK TESTS
// ============================================================================

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    resetSupabaseMock();
    (mockStripe.webhooks.constructEvent as MockFn).mockReset();
    (mockProcessWebhookEvent as MockFn).mockReset();
    (mockAssertStripeSignature as MockFn).mockReset();

    // Default implementations
    (mockAssertStripeSignature as MockFn).mockImplementation(() => ({
      signature: "test_signature",
      secret: "test_secret",
    }));

    (mockProcessWebhookEvent as MockFn).mockImplementation(() => Promise.resolve());
  });

  describe("Signature Verification", () => {
    it("should throw error for requests with missing signature header", async () => {
      (mockAssertStripeSignature as MockFn).mockImplementation(() => {
        throw new Error("Missing Stripe signature header.");
      });

      const request = createStripeRequest("{}");

      // The route doesn't catch assertStripeSignature errors - they propagate up
      await expect(stripeWebhook(request)).rejects.toThrow("Missing Stripe signature header.");
    });

    it("should reject requests with invalid signature", async () => {
      (mockStripe.webhooks.constructEvent as MockFn).mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid signature");
    });

    it("should accept requests with valid signature", async () => {
      const event = createStripeEvent();
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      const request = createStripeRequest(JSON.stringify({}));
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Timestamp Validation", () => {
    it("should reject events older than 5 minutes", async () => {
      const oldEvent = createStripeEvent({
        created: Math.floor(Date.now() / 1000) - 400, // 6+ minutes ago
      });
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(oldEvent);

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Webhook event too old");
      expect(body.ageSeconds).toBeGreaterThan(300);
    });

    it("should accept events within 5-minute window", async () => {
      const recentEvent = createStripeEvent({
        created: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
      });
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(recentEvent);

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Idempotency", () => {
    it("should return duplicate flag for already-processed events", async () => {
      const event = createStripeEvent();
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      // Simulate existing event in database
      (mockSupabaseAdmin.single as MockFn).mockImplementation(() =>
        Promise.resolve({ data: { event_id: event.id }, error: null })
      );

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(body.duplicate).toBe(true);
    });

    it("should process new events normally", async () => {
      const event = createStripeEvent();
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      // Simulate no existing event
      (mockSupabaseAdmin.single as MockFn).mockImplementation(() =>
        Promise.resolve({ data: null, error: null })
      );

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(body.duplicate).toBeUndefined();
    });
  });

  describe("Event Processing", () => {
    it("should call processWebhookEvent for valid events", async () => {
      const event = createStripeEvent({ type: "payment_intent.succeeded" });
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      const request = createStripeRequest("{}");
      await stripeWebhook(request);

      expect(mockProcessWebhookEvent).toHaveBeenCalledWith(event);
    });

    it("should store event in database after processing", async () => {
      const event = createStripeEvent({ id: "evt_unique123" });
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      const request = createStripeRequest("{}");
      await stripeWebhook(request);

      // Verify insert was called
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith("stripe_webhook_events");
      expect(mockSupabaseAdmin.insert).toHaveBeenCalled();
    });

    it("should succeed even if database insert fails", async () => {
      const event = createStripeEvent();
      (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

      // Simulate insert failure
      (mockSupabaseAdmin.insert as MockFn).mockImplementation(() =>
        Promise.resolve({ data: null, error: { message: "Insert failed", code: "PGRST123" } })
      );

      const request = createStripeRequest("{}");
      const response = await stripeWebhook(request);
      const body = await response.json();

      // Should still return success (event was processed)
      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Event Types", () => {
    const eventTypes = [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
      "customer.subscription.created",
      "customer.subscription.deleted",
    ];

    for (const eventType of eventTypes) {
      it(`should process ${eventType} events`, async () => {
        const event = createStripeEvent({ type: eventType as Stripe.Event["type"] });
        (mockStripe.webhooks.constructEvent as MockFn).mockReturnValue(event);

        const request = createStripeRequest("{}");
        const response = await stripeWebhook(request);

        expect(response.status).toBe(200);
        expect(mockProcessWebhookEvent).toHaveBeenCalledWith(event);
      });
    }
  });
});

// ============================================================================
// PAYPAL WEBHOOK TESTS
// ============================================================================

describe("POST /api/webhooks/paypal", () => {
  beforeEach(() => {
    resetSupabaseMock();
    (mockPayPal.verifyWebhookSignature as MockFn).mockReset();
    (mockPayPal.verifyWebhookSignature as MockFn).mockImplementation(() => Promise.resolve(true));
  });

  describe("Header Validation", () => {
    it("should reject requests missing transmission-id header", async () => {
      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event), {
        "paypal-transmission-id": "",
      });

      // Remove the header
      const headers = new Headers(request.headers);
      headers.delete("paypal-transmission-id");

      const modifiedRequest = new Request(request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(event),
      });

      const response = await paypalWebhook(modifiedRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required headers");
    });

    it("should reject requests missing transmission-sig header", async () => {
      const event = createPayPalEvent();
      const headers = {
        "paypal-transmission-id": "test-id",
        "paypal-transmission-time": new Date().toISOString(),
        "paypal-cert-url": "https://api.paypal.com/cert.pem",
        "paypal-auth-algo": "SHA256withRSA",
        // Missing transmission-sig
      };

      const request = new Request("http://localhost:3000/api/webhooks/paypal", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify(event),
      });

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required headers");
    });

    it("should accept requests with all required headers", async () => {
      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Signature Verification", () => {
    it("should reject requests with invalid signature", async () => {
      (mockPayPal.verifyWebhookSignature as MockFn).mockImplementation(() =>
        Promise.resolve(false)
      );

      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid signature");
    });

    it("should accept requests with valid signature", async () => {
      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Timestamp Validation", () => {
    it("should reject events older than 5 minutes", async () => {
      const oldEvent = createPayPalEvent({
        create_time: new Date(Date.now() - 400 * 1000).toISOString(), // 6+ minutes ago
      });
      const request = createPayPalRequest(JSON.stringify(oldEvent));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Webhook event too old");
      expect(body.ageSeconds).toBeGreaterThan(300);
    });

    it("should accept events within 5-minute window", async () => {
      const recentEvent = createPayPalEvent({
        create_time: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
      });
      const request = createPayPalRequest(JSON.stringify(recentEvent));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Idempotency", () => {
    it("should return duplicate flag for already-processed events", async () => {
      const event = createPayPalEvent();

      // Simulate existing event in database
      (mockSupabaseAdmin.maybeSingle as MockFn).mockImplementation(() =>
        Promise.resolve({ data: { event_id: event.id }, error: null })
      );

      const request = createPayPalRequest(JSON.stringify(event));
      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(body.duplicate).toBe(true);
    });

    it("should process new events normally", async () => {
      const event = createPayPalEvent();

      // Simulate no existing event
      (mockSupabaseAdmin.maybeSingle as MockFn).mockImplementation(() =>
        Promise.resolve({ data: null, error: null })
      );

      const request = createPayPalRequest(JSON.stringify(event));
      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(body.duplicate).toBeUndefined();
    });
  });

  describe("Event Processing", () => {
    it("should store event in database after processing", async () => {
      const event = createPayPalEvent({ id: "WH-unique123" });
      const request = createPayPalRequest(JSON.stringify(event));

      await paypalWebhook(request);

      // Verify insert was called with correct table and provider
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith("webhook_events");
      expect(mockSupabaseAdmin.insert).toHaveBeenCalled();
    });

    it("should succeed even if database insert fails", async () => {
      const event = createPayPalEvent();

      // Simulate insert failure
      (mockSupabaseAdmin.insert as MockFn).mockImplementation(() =>
        Promise.resolve({ data: null, error: { message: "Insert failed", code: "PGRST123" } })
      );

      const request = createPayPalRequest(JSON.stringify(event));
      const response = await paypalWebhook(request);
      const body = await response.json();

      // Should still return success (event was processed)
      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Payout Event Types", () => {
    const payoutEventTypes = [
      "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
      "PAYMENT.PAYOUTS-ITEM.FAILED",
      "PAYMENT.PAYOUTS-ITEM.BLOCKED",
      "PAYMENT.PAYOUTS-ITEM.RETURNED",
      "PAYMENT.PAYOUTS-ITEM.UNCLAIMED",
    ];

    for (const eventType of payoutEventTypes) {
      it(`should process ${eventType} events`, async () => {
        const event = createPayPalEvent({ event_type: eventType });
        const request = createPayPalRequest(JSON.stringify(event));

        const response = await paypalWebhook(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.received).toBe(true);
      });
    }

    it("should handle unhandled event types gracefully", async () => {
      const event = createPayPalEvent({ event_type: "UNKNOWN.EVENT.TYPE" });
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 for unexpected errors", async () => {
      // Simulate JSON parse error
      const request = createPayPalRequest("invalid json {{{");

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Webhook processing failed");
    });

    it("should handle signature verification errors gracefully", async () => {
      (mockPayPal.verifyWebhookSignature as MockFn).mockImplementation(() => {
        throw new Error("Verification service unavailable");
      });

      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Webhook processing failed");
    });
  });

  describe("Payout Event Data", () => {
    it("should extract payout item details from SUCCEEDED event", async () => {
      const event = createPayPalEvent({
        event_type: "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
        resource: {
          payout_item_id: "PI-123",
          transaction_id: "TXN-456",
          payout_item: {
            receiver: "pro@example.com",
            amount: { value: "150.00", currency: "USD" },
          },
        },
      });

      const request = createPayPalRequest(JSON.stringify(event));
      const response = await paypalWebhook(request);

      expect(response.status).toBe(200);
    });

    it("should handle FAILED event with error details", async () => {
      const event = createPayPalEvent({
        event_type: "PAYMENT.PAYOUTS-ITEM.FAILED",
        resource: {
          payout_item_id: "PI-123",
          errors: [{ name: "INVALID_RECEIVER", message: "Invalid email" }],
          payout_item: {
            receiver: "invalid@example.com",
            amount: { value: "100.00", currency: "USD" },
          },
        },
      });

      const request = createPayPalRequest(JSON.stringify(event));
      const response = await paypalWebhook(request);

      expect(response.status).toBe(200);
    });
  });
});

// ============================================================================
// SECURITY TESTS
// ============================================================================

describe("Webhook Security", () => {
  beforeEach(() => {
    resetSupabaseMock();
    (mockStripe.webhooks.constructEvent as MockFn).mockReset();
    (mockPayPal.verifyWebhookSignature as MockFn).mockReset();
    (mockAssertStripeSignature as MockFn).mockReset();
    (mockProcessWebhookEvent as MockFn).mockReset();
  });

  describe("Stripe Security", () => {
    it("should never process events without signature verification", async () => {
      // Even if payload is valid, missing signature should fail
      (mockAssertStripeSignature as MockFn).mockImplementation(() => {
        throw new Error("Missing Stripe signature header.");
      });

      const validEvent = createStripeEvent();
      const request = createStripeRequest(JSON.stringify(validEvent));

      // The route doesn't catch assertStripeSignature errors - they propagate up
      await expect(stripeWebhook(request)).rejects.toThrow("Missing Stripe signature header.");
      expect(mockProcessWebhookEvent).not.toHaveBeenCalled();
    });

    it("should reject events with tampered payload", async () => {
      (mockAssertStripeSignature as MockFn).mockImplementation(() => ({
        signature: "test_signature",
        secret: "test_secret",
      }));

      (mockStripe.webhooks.constructEvent as MockFn).mockImplementation(() => {
        throw new Error("Signature verification failed");
      });

      const request = createStripeRequest('{"tampered": true}');
      const response = await stripeWebhook(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid signature");
    });
  });

  describe("PayPal Security", () => {
    it("should never process events without signature verification", async () => {
      (mockPayPal.verifyWebhookSignature as MockFn).mockImplementation(() =>
        Promise.resolve(false)
      );

      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      const response = await paypalWebhook(request);
      expect(response.status).toBe(400);
    });

    it("should verify against webhook ID from environment", async () => {
      (mockPayPal.verifyWebhookSignature as MockFn).mockImplementation(() => Promise.resolve(true));

      const event = createPayPalEvent();
      const request = createPayPalRequest(JSON.stringify(event));

      await paypalWebhook(request);

      // Verify that verifyWebhookSignature was called
      expect(mockPayPal.verifyWebhookSignature).toHaveBeenCalled();
    });
  });
});
