/**
 * Stripe Mock Factory
 *
 * Provides comprehensive mocks for Stripe operations in tests.
 * Use these mocks to test payment processing logic without hitting real Stripe API.
 *
 * @example
 * ```ts
 * import { createMockStripe, createMockPaymentIntent } from '@/lib/__mocks__/stripe';
 *
 * describe('PaymentService', () => {
 *   it('should create payment intent', async () => {
 *     const mockStripe = createMockStripe();
 *     mockStripe.paymentIntents.create.mockResolvedValue(
 *       createMockPaymentIntent({ amount: 100000 })
 *     );
 *
 *     const result = await createPayment(mockStripe, { amount: 100000 });
 *     expect(result.amount).toBe(100000);
 *   });
 * });
 * ```
 */

import type Stripe from "stripe";

// ============================================================================
// TYPES
// ============================================================================

// Bun test mock function type
export type MockFn<T> = {
  (...args: any[]): Promise<T>;
  mockResolvedValue(value: T): MockFn<T>;
  mockRejectedValue(error: Error): MockFn<T>;
  mockImplementation(impl: (...args: any[]) => Promise<T>): MockFn<T>;
};

export type MockFnSync<T> = {
  (...args: any[]): T;
  mockReturnValue(value: T): MockFnSync<T>;
  mockImplementation(impl: (...args: any[]) => T): MockFnSync<T>;
};

export type MockStripeClient = {
  paymentIntents: {
    create: MockFn<Stripe.PaymentIntent>;
    retrieve: MockFn<Stripe.PaymentIntent>;
    update: MockFn<Stripe.PaymentIntent>;
    cancel: MockFn<Stripe.PaymentIntent>;
    confirm: MockFn<Stripe.PaymentIntent>;
    capture: MockFn<Stripe.PaymentIntent>;
    list: MockFn<Stripe.ApiList<Stripe.PaymentIntent>>;
  };
  customers: {
    create: MockFn<Stripe.Customer>;
    retrieve: MockFn<Stripe.Customer>;
    update: MockFn<Stripe.Customer>;
    del: MockFn<Stripe.DeletedCustomer>;
    list: MockFn<Stripe.ApiList<Stripe.Customer>>;
  };
  charges: {
    create: MockFn<Stripe.Charge>;
    retrieve: MockFn<Stripe.Charge>;
    update: MockFn<Stripe.Charge>;
    list: MockFn<Stripe.ApiList<Stripe.Charge>>;
  };
  refunds: {
    create: MockFn<Stripe.Refund>;
    retrieve: MockFn<Stripe.Refund>;
    update: MockFn<Stripe.Refund>;
    list: MockFn<Stripe.ApiList<Stripe.Refund>>;
  };
  paymentMethods: {
    create: MockFn<Stripe.PaymentMethod>;
    retrieve: MockFn<Stripe.PaymentMethod>;
    attach: MockFn<Stripe.PaymentMethod>;
    detach: MockFn<Stripe.PaymentMethod>;
    list: MockFn<Stripe.ApiList<Stripe.PaymentMethod>>;
  };
  webhooks: {
    constructEvent: MockFnSync<Stripe.Event>;
  };
};

// ============================================================================
// MOCK STRIPE CLIENT
// ============================================================================

/**
 * Creates a mock Stripe client with common operations
 *
 * @example
 * ```ts
 * const mockStripe = createMockStripe();
 *
 * // Set up mock responses
 * mockStripe.paymentIntents.create.mockResolvedValue(
 *   createMockPaymentIntent({ amount: 100000 })
 * );
 *
 * // Use in service tests
 * const intent = await mockStripe.paymentIntents.create({ amount: 100000 });
 * ```
 */
export function createMockStripe(): MockStripeClient {
  // Mock function helper for async operations
  const mockFn = <T>(): MockFn<T> => {
    let mockImpl: ((...args: any[]) => Promise<T>) | undefined;
    const fn = (...args: any[]): Promise<T> => {
      if (mockImpl) {
        return mockImpl(...args);
      }
      return Promise.resolve({} as T);
    };
    fn.mockResolvedValue = (value: T) => {
      mockImpl = () => Promise.resolve(value);
      return fn as MockFn<T>;
    };
    fn.mockRejectedValue = (error: Error) => {
      mockImpl = () => Promise.reject(error);
      return fn as MockFn<T>;
    };
    fn.mockImplementation = (impl: (...args: any[]) => Promise<T>) => {
      mockImpl = impl;
      return fn as MockFn<T>;
    };
    return fn as MockFn<T>;
  };

  // Synchronous mock for webhooks.constructEvent
  const mockConstructEvent = ((..._args: any[]): Stripe.Event =>
    createMockWebhookEvent("payment_intent.succeeded")) as MockFnSync<Stripe.Event>;
  mockConstructEvent.mockReturnValue = (value: Stripe.Event) => {
    const newFn = (() => value) as MockFnSync<Stripe.Event>;
    newFn.mockReturnValue = mockConstructEvent.mockReturnValue;
    newFn.mockImplementation = mockConstructEvent.mockImplementation;
    return newFn;
  };
  mockConstructEvent.mockImplementation = (impl: (...args: any[]) => Stripe.Event) => {
    const newFn = impl as MockFnSync<Stripe.Event>;
    newFn.mockReturnValue = mockConstructEvent.mockReturnValue;
    newFn.mockImplementation = mockConstructEvent.mockImplementation;
    return newFn;
  };

  return {
    paymentIntents: {
      create: mockFn<Stripe.PaymentIntent>(),
      retrieve: mockFn<Stripe.PaymentIntent>(),
      update: mockFn<Stripe.PaymentIntent>(),
      cancel: mockFn<Stripe.PaymentIntent>(),
      confirm: mockFn<Stripe.PaymentIntent>(),
      capture: mockFn<Stripe.PaymentIntent>(),
      list: mockFn<Stripe.ApiList<Stripe.PaymentIntent>>(),
    },
    customers: {
      create: mockFn<Stripe.Customer>(),
      retrieve: mockFn<Stripe.Customer>(),
      update: mockFn<Stripe.Customer>(),
      del: mockFn<Stripe.DeletedCustomer>(),
      list: mockFn<Stripe.ApiList<Stripe.Customer>>(),
    },
    charges: {
      create: mockFn<Stripe.Charge>(),
      retrieve: mockFn<Stripe.Charge>(),
      update: mockFn<Stripe.Charge>(),
      list: mockFn<Stripe.ApiList<Stripe.Charge>>(),
    },
    refunds: {
      create: mockFn<Stripe.Refund>(),
      retrieve: mockFn<Stripe.Refund>(),
      update: mockFn<Stripe.Refund>(),
      list: mockFn<Stripe.ApiList<Stripe.Refund>>(),
    },
    paymentMethods: {
      create: mockFn<Stripe.PaymentMethod>(),
      retrieve: mockFn<Stripe.PaymentMethod>(),
      attach: mockFn<Stripe.PaymentMethod>(),
      detach: mockFn<Stripe.PaymentMethod>(),
      list: mockFn<Stripe.ApiList<Stripe.PaymentMethod>>(),
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  };
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Creates mock PaymentIntent data
 */
export function createMockPaymentIntent(
  overrides?: Partial<Stripe.PaymentIntent>
): Stripe.PaymentIntent {
  return {
    id: "pi_mock_123",
    object: "payment_intent",
    amount: 100_000,
    amount_capturable: 0,
    amount_received: 0,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: "automatic",
    client_secret: "pi_mock_123_secret_abc",
    confirmation_method: "automatic",
    created: Math.floor(Date.now() / 1000),
    currency: "cop",
    customer: null,
    description: null,
    invoice: null,
    last_payment_error: null,
    latest_charge: null,
    livemode: false,
    metadata: {},
    next_action: null,
    on_behalf_of: null,
    payment_method: null,
    payment_method_configuration_details: null,
    payment_method_options: null,
    payment_method_types: ["card"],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: "requires_payment_method",
    transfer_data: null,
    transfer_group: null,
    ...overrides,
  } as Stripe.PaymentIntent;
}

/**
 * Creates mock Customer data
 */
export function createMockCustomer(overrides?: Partial<Stripe.Customer>): Stripe.Customer {
  return {
    id: "cus_mock_456",
    object: "customer",
    address: null,
    balance: 0,
    created: Math.floor(Date.now() / 1000),
    currency: "cop",
    default_source: null,
    delinquent: false,
    description: null,
    discount: null,
    email: "test@example.com",
    invoice_prefix: "TEST",
    invoice_settings: {
      custom_fields: null,
      default_payment_method: null,
      footer: null,
      rendering_options: null,
    },
    livemode: false,
    metadata: {},
    name: "Test Customer",
    phone: null,
    preferred_locales: [],
    shipping: null,
    tax_exempt: "none",
    test_clock: null,
    ...overrides,
  } as Stripe.Customer;
}

/**
 * Creates mock Charge data
 */
function createMockCharge(overrides?: Partial<Stripe.Charge>): Stripe.Charge {
  return {
    id: "ch_mock_789",
    object: "charge",
    amount: 100_000,
    amount_captured: 100_000,
    amount_refunded: 0,
    application: null,
    application_fee: null,
    application_fee_amount: null,
    balance_transaction: null,
    billing_details: {
      address: null,
      email: null,
      name: null,
      phone: null,
    },
    calculated_statement_descriptor: null,
    captured: true,
    created: Math.floor(Date.now() / 1000),
    currency: "cop",
    customer: null,
    description: null,
    disputed: false,
    failure_balance_transaction: null,
    failure_code: null,
    failure_message: null,
    fraud_details: {},
    invoice: null,
    livemode: false,
    metadata: {},
    on_behalf_of: null,
    outcome: null,
    paid: true,
    payment_intent: null,
    payment_method: null,
    payment_method_details: null,
    radar_options: null,
    receipt_email: null,
    receipt_number: null,
    receipt_url: null,
    refunded: false,
    refunds: {
      object: "list",
      data: [],
      has_more: false,
      url: "/v1/charges/ch_mock_789/refunds",
    },
    review: null,
    shipping: null,
    source_transfer: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: "succeeded",
    transfer_data: null,
    transfer_group: null,
    ...overrides,
  } as Stripe.Charge;
}

/**
 * Creates mock Refund data
 */
export function createMockRefund(overrides?: Partial<Stripe.Refund>): Stripe.Refund {
  return {
    id: "re_mock_012",
    object: "refund",
    amount: 50_000,
    balance_transaction: null,
    charge: "ch_mock_789",
    created: Math.floor(Date.now() / 1000),
    currency: "cop",
    description: null,
    failure_balance_transaction: null,
    failure_reason: null,
    metadata: {},
    payment_intent: null,
    reason: null,
    receipt_number: null,
    source_transfer_reversal: null,
    status: "succeeded",
    transfer_reversal: null,
    ...overrides,
  } as Stripe.Refund;
}

/**
 * Creates mock PaymentMethod data
 */
function createMockPaymentMethod(overrides?: Partial<Stripe.PaymentMethod>): Stripe.PaymentMethod {
  return {
    id: "pm_mock_345",
    object: "payment_method",
    billing_details: {
      address: null,
      email: null,
      name: null,
      phone: null,
    },
    card: {
      brand: "visa",
      checks: null,
      country: "CO",
      exp_month: 12,
      exp_year: 2025,
      fingerprint: null,
      funding: "credit",
      generated_from: null,
      last4: "4242",
      networks: null,
      three_d_secure_usage: null,
      wallet: null,
    },
    created: Math.floor(Date.now() / 1000),
    customer: null,
    livemode: false,
    metadata: {},
    type: "card",
    ...overrides,
  } as Stripe.PaymentMethod;
}

/**
 * Creates mock Webhook Event data
 */
export function createMockWebhookEvent(
  type: Stripe.Event.Type,
  data?: Record<string, unknown>
): Stripe.Event {
  return {
    id: "evt_mock_678",
    object: "event",
    api_version: "2025-10-29.clover",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: data || createMockPaymentIntent(),
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type,
  } as Stripe.Event;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Creates a mock Stripe error for testing error handling
 */
export function createMockStripeError(
  type: Stripe.StripeRawError["type"],
  message: string,
  code?: string
): Stripe.StripeError {
  const error = new Error(message) as Stripe.StripeError;
  error.type = type;
  error.code = code;
  error.statusCode = type === "card_error" ? 402 : 500;
  return error;
}

/**
 * Creates mock webhook signature headers
 */
function createMockWebhookSignature(): { signature: string; secret: string } {
  return {
    signature: "t=1614556800,v1=mock_signature_abc123",
    secret: "whsec_test_mock_secret",
  };
}

/**
 * Mock successful payment flow
 */
function mockSuccessfulPayment(mockStripe: MockStripeClient, amount: number) {
  const paymentIntent = createMockPaymentIntent({
    amount,
    status: "succeeded",
    amount_received: amount,
  });

  mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent);
  mockStripe.paymentIntents.confirm.mockResolvedValue(paymentIntent);
  mockStripe.paymentIntents.retrieve.mockResolvedValue(paymentIntent);

  return paymentIntent;
}

/**
 * Mock failed payment flow
 */
function mockFailedPayment(mockStripe: MockStripeClient, reason: string) {
  const error = createMockStripeError("card_error", reason, "card_declined");

  mockStripe.paymentIntents.create.mockRejectedValue(error);
  mockStripe.paymentIntents.confirm.mockRejectedValue(error);

  return error;
}
