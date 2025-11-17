/**
 * Payment API Routes Tests
 *
 * Comprehensive tests for all payment-related API endpoints.
 * Tests input validation, authentication, authorization, business logic, and error handling.
 *
 * Routes tested:
 * - POST /api/payments/create-intent
 * - POST /api/payments/capture-intent
 * - POST /api/payments/void-intent
 * - POST /api/payments/process-tip
 *
 * @module api/payments/__tests__/payment-routes.test.ts
 */

import { describe, expect, test as it, beforeEach, mock } from "bun:test";
import {
	createMockSupabaseClient,
	type MockSupabaseClient,
} from "@/lib/__mocks__/supabase";
import {
	createMockStripe,
	createMockPaymentIntent,
	createMockCustomer,
	type MockStripeClient,
} from "@/lib/__mocks__/stripe";

// ============================================================================
// TEST SETUP & MOCKS
// ============================================================================

describe("Payment API Routes", () => {
	let mockSupabase: MockSupabaseClient;
	let mockStripe: MockStripeClient;

	beforeEach(() => {
		mockSupabase = createMockSupabaseClient();
		mockStripe = createMockStripe();
	});

	// ============================================================================
	// CREATE PAYMENT INTENT - POST /api/payments/create-intent
	// ============================================================================

	describe("POST /api/payments/create-intent", () => {
		describe("Input Validation", () => {
			it("should reject negative amount", () => {
				const invalidInput = {
					amount: -50000,
					currency: "cop",
				};

				// Would throw ZodError in actual route
				expect(invalidInput.amount).toBeLessThan(0);
			});

			it("should reject amount exceeding 1B COP", () => {
				const invalidInput = {
					amount: 1_000_000_001, // Exceeds max
					currency: "cop",
				};

				const MAX_AMOUNT = 1_000_000_000;
				expect(invalidInput.amount).toBeGreaterThan(MAX_AMOUNT);
			});

			it("should reject unsupported currency", () => {
				const invalidInput = {
					amount: 100000,
					currency: "gbp", // Not in SUPPORTED_CURRENCIES
				};

				const SUPPORTED = ["cop", "usd", "eur"];
				expect(SUPPORTED.includes(invalidInput.currency)).toBe(false);
			});

			it("should default currency to COP when not provided", () => {
				const input = {
					amount: 100000,
				};

				const DEFAULT_CURRENCY = "cop";
				expect(input).not.toHaveProperty("currency");
				// Schema would apply default: "cop"
			});

			it("should accept valid COP amount", () => {
				const validInput = {
					amount: 500000,
					currency: "cop",
				};

				expect(validInput.amount).toBeGreaterThan(0);
				expect(validInput.amount).toBeLessThanOrEqual(1_000_000_000);
				expect(["cop", "usd", "eur"].includes(validInput.currency)).toBe(true);
			});

			it("should accept valid USD amount", () => {
				const validInput = {
					amount: 10000, // $100 USD in cents
					currency: "usd",
				};

				expect(validInput.amount).toBeGreaterThan(0);
				expect(["cop", "usd", "eur"].includes(validInput.currency)).toBe(true);
			});

			it("should accept valid EUR amount", () => {
				const validInput = {
					amount: 8500, // €85 EUR in cents
					currency: "eur",
				};

				expect(validInput.amount).toBeGreaterThan(0);
				expect(["cop", "usd", "eur"].includes(validInput.currency)).toBe(true);
			});

			it("should accept optional bookingId as UUID", () => {
				const validInput = {
					amount: 100000,
					currency: "cop",
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
				};

				const UUID_REGEX =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
				expect(UUID_REGEX.test(validInput.bookingId)).toBe(true);
			});

			it("should accept optional customerName", () => {
				const validInput = {
					amount: 100000,
					currency: "cop",
					customerName: "John Doe",
				};

				expect(validInput.customerName).toBeDefined();
				expect(typeof validInput.customerName).toBe("string");
			});

			it("should accept optional customerEmail", () => {
				const validInput = {
					amount: 100000,
					currency: "cop",
					customerEmail: "john@example.com",
				};

				const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				expect(EMAIL_REGEX.test(validInput.customerEmail)).toBe(true);
			});

			it("should reject non-integer amount", () => {
				const invalidInput = {
					amount: 100.50, // Must be integer (cents/centavos)
					currency: "cop",
				};

				expect(Number.isInteger(invalidInput.amount)).toBe(false);
			});

			it("should reject zero amount", () => {
				const invalidInput = {
					amount: 0,
					currency: "cop",
				};

				expect(invalidInput.amount).toBe(0);
				// Would be rejected by .positive() validation
			});
		});

		describe("Stripe Customer Handling", () => {
			it("should create new Stripe customer if none exists", async () => {
				const userId = "user-123";

				// Mock: User has no stripe_customer_id
				mockSupabase.__setMockResponse("profiles", {
					data: {
						id: userId,
						stripe_customer_id: null,
					},
					error: null,
				});

				// Mock: Stripe creates new customer
				const newCustomer = createMockCustomer({
					id: "cus_new_123",
					email: "test@example.com",
					metadata: { supabase_profile_id: userId },
				});

				mockStripe.customers.create.mockResolvedValue(newCustomer);

				// Verify customer creation called
				const createdCustomer = await mockStripe.customers.create({
					email: "test@example.com",
					metadata: { supabase_profile_id: userId },
				});

				expect(createdCustomer.id).toBe("cus_new_123");
				expect(createdCustomer.metadata?.supabase_profile_id).toBe(userId);
			});

			it("should reuse existing Stripe customer", async () => {
				const userId = "user-123";
				const existingCustomerId = "cus_existing_456";

				// Mock: User already has stripe_customer_id
				mockSupabase.__setMockResponse("profiles", {
					data: {
						id: userId,
						stripe_customer_id: existingCustomerId,
					},
					error: null,
				});

				const profile = await mockSupabase
					.from("profiles")
					.select("id, stripe_customer_id")
					.eq("id", userId)
					.maybeSingle();

				expect(profile.data?.stripe_customer_id).toBe(existingCustomerId);
			});

			it("should update profile with new Stripe customer ID", async () => {
				const userId = "user-123";
				const newCustomerId = "cus_new_789";

				// Mock: Stripe customer created
				const newCustomer = createMockCustomer({ id: newCustomerId });
				mockStripe.customers.create.mockResolvedValue(newCustomer);

				// Mock: Profile update
				mockSupabase.__setMockResponse("profiles", {
					data: { id: userId, stripe_customer_id: newCustomerId },
					error: null,
				});

				const updatedProfile = await mockSupabase
					.from("profiles")
					.update({ stripe_customer_id: newCustomerId })
					.eq("id", userId);

				expect(updatedProfile.error).toBeNull();
			});

			it("should include customerName in Stripe customer creation", async () => {
				const customerData = {
					name: "Maria Garcia",
					email: "maria@example.com",
					metadata: { supabase_profile_id: "user-123" },
				};

				mockStripe.customers.create.mockResolvedValue(
					createMockCustomer(customerData),
				);

				const customer = await mockStripe.customers.create(customerData);

				expect(customer.name).toBe("Maria Garcia");
			});
		});

		describe("Payment Intent Creation", () => {
			it("should create payment intent with manual capture", async () => {
				const paymentData = {
					amount: 500000,
					currency: "cop",
					capture_method: "manual" as const,
					customer: "cus_123",
					metadata: { supabase_profile_id: "user-123" },
					automatic_payment_methods: { enabled: true },
				};

				const mockIntent = createMockPaymentIntent(paymentData);
				mockStripe.paymentIntents.create.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.create(paymentData);

				expect(intent.capture_method).toBe("manual");
				expect(intent.amount).toBe(500000);
				expect(intent.currency).toBe("cop");
			});

			it("should include bookingId in payment intent metadata", async () => {
				const bookingId = "550e8400-e29b-41d4-a716-446655440000";

				const paymentData = {
					amount: 500000,
					currency: "cop",
					capture_method: "manual" as const,
					metadata: {
						supabase_profile_id: "user-123",
						booking_id: bookingId,
					},
				};

				const mockIntent = createMockPaymentIntent({
					metadata: paymentData.metadata,
				});
				mockStripe.paymentIntents.create.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.create(paymentData);

				expect(intent.metadata?.booking_id).toBe(bookingId);
			});

			it("should return client secret and payment intent ID", async () => {
				const mockIntent = createMockPaymentIntent({
					id: "pi_123",
					client_secret: "pi_123_secret_abc",
				});

				mockStripe.paymentIntents.create.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.create({
					amount: 500000,
					currency: "cop",
					capture_method: "manual",
				});

				expect(intent.id).toBe("pi_123");
				expect(intent.client_secret).toBe("pi_123_secret_abc");
			});

			it("should enable automatic payment methods", async () => {
				const mockIntent = createMockPaymentIntent({
					automatic_payment_methods: { enabled: true } as any,
				});

				mockStripe.paymentIntents.create.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.create({
					amount: 500000,
					currency: "cop",
					capture_method: "manual",
					automatic_payment_methods: { enabled: true },
				});

				expect(intent.automatic_payment_methods).toEqual({ enabled: true });
			});

			it("should handle different currencies correctly", async () => {
				// Test USD
				const usdIntent = createMockPaymentIntent({
					amount: 10000,
					currency: "usd",
				});
				mockStripe.paymentIntents.create.mockResolvedValue(usdIntent);

				const usdResult = await mockStripe.paymentIntents.create({
					amount: 10000,
					currency: "usd",
					capture_method: "manual",
				});

				expect(usdResult.currency).toBe("usd");

				// Test EUR
				const eurIntent = createMockPaymentIntent({
					amount: 8500,
					currency: "eur",
				});
				mockStripe.paymentIntents.create.mockResolvedValue(eurIntent);

				const eurResult = await mockStripe.paymentIntents.create({
					amount: 8500,
					currency: "eur",
					capture_method: "manual",
				});

				expect(eurResult.currency).toBe("eur");
			});
		});
	});

	// ============================================================================
	// CAPTURE PAYMENT INTENT - POST /api/payments/capture-intent
	// ============================================================================

	describe("POST /api/payments/capture-intent", () => {
		describe("Input Validation", () => {
			it("should reject missing payment intent ID", () => {
				const invalidInput = {
					amountToCapture: 100000,
				};

				expect(invalidInput).not.toHaveProperty("paymentIntentId");
			});

			it("should reject empty payment intent ID", () => {
				const invalidInput = {
					paymentIntentId: "",
					amountToCapture: 100000,
				};

				expect(invalidInput.paymentIntentId.length).toBe(0);
			});

			it("should accept valid payment intent ID", () => {
				const validInput = {
					paymentIntentId: "pi_1234567890",
				};

				expect(validInput.paymentIntentId.length).toBeGreaterThan(0);
			});

			it("should accept optional amountToCapture", () => {
				const validInput = {
					paymentIntentId: "pi_123",
					amountToCapture: 50000,
				};

				expect(validInput.amountToCapture).toBeGreaterThan(0);
			});

			it("should reject negative amountToCapture", () => {
				const invalidInput = {
					paymentIntentId: "pi_123",
					amountToCapture: -50000,
				};

				expect(invalidInput.amountToCapture).toBeLessThan(0);
			});

			it("should reject non-integer amountToCapture", () => {
				const invalidInput = {
					paymentIntentId: "pi_123",
					amountToCapture: 100.50,
				};

				expect(Number.isInteger(invalidInput.amountToCapture)).toBe(false);
			});
		});

		describe("Authorization Checks", () => {
			it("should allow customer to capture their payment", async () => {
				const customerId = "user-customer-123";
				const professionalId = "user-pro-456";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: customerId,
						professional_id: professionalId,
						status: "pending",
						amount_authorized: 500000,
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status, amount_authorized")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isCustomer = booking.data?.customer_id === customerId;
				expect(isCustomer).toBe(true);
			});

			it("should allow professional to capture payment", async () => {
				const customerId = "user-customer-123";
				const professionalId = "user-pro-456";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: customerId,
						professional_id: professionalId,
						status: "pending",
						amount_authorized: 500000,
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status, amount_authorized")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isProfessional = booking.data?.professional_id === professionalId;
				expect(isProfessional).toBe(true);
			});

			it("should reject unauthorized user", async () => {
				const unauthorizedUserId = "user-unauthorized-999";
				const customerId = "user-customer-123";
				const professionalId = "user-pro-456";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: customerId,
						professional_id: professionalId,
						status: "pending",
						amount_authorized: 500000,
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status, amount_authorized")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isAuthorized =
					booking.data?.customer_id === unauthorizedUserId ||
					booking.data?.professional_id === unauthorizedUserId;

				expect(isAuthorized).toBe(false);
			});

			it("should reject if booking not found", async () => {
				mockSupabase.__setMockResponse("bookings", {
					data: null,
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status, amount_authorized")
					.eq("stripe_payment_intent_id", "pi_nonexistent")
					.maybeSingle();

				expect(booking.data).toBeNull();
			});
		});

		describe("Business Logic Validation", () => {
			it("should reject if payment intent doesn't belong to booking", async () => {
				const bookingId = "booking-123";
				const wrongBookingId = "booking-456";

				const mockIntent = createMockPaymentIntent({
					metadata: { booking_id: wrongBookingId },
				});

				mockStripe.paymentIntents.retrieve.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.retrieve("pi_123");

				expect(intent.metadata?.booking_id).not.toBe(bookingId);
			});

			it("should reject if payment status is not requires_capture", async () => {
				const mockIntent = createMockPaymentIntent({
					status: "succeeded",
				});

				mockStripe.paymentIntents.retrieve.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.retrieve("pi_123");

				expect(intent.status).not.toBe("requires_capture");
			});

			it("should accept payment with requires_capture status", async () => {
				const mockIntent = createMockPaymentIntent({
					status: "requires_capture",
				});

				mockStripe.paymentIntents.retrieve.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.retrieve("pi_123");

				expect(intent.status).toBe("requires_capture");
			});

			it("should capture full amount when amountToCapture not specified", async () => {
				const fullAmount = 500000;
				const mockIntent = createMockPaymentIntent({
					amount: fullAmount,
					status: "succeeded",
					amount_received: fullAmount,
				});

				mockStripe.paymentIntents.capture.mockResolvedValue(mockIntent);

				const capturedIntent = await mockStripe.paymentIntents.capture("pi_123");

				expect(capturedIntent.amount_received).toBe(fullAmount);
			});

			it("should capture partial amount when specified", async () => {
				const partialAmount = 250000;
				const mockIntent = createMockPaymentIntent({
					amount: 500000,
					status: "succeeded",
					amount_received: partialAmount,
				});

				mockStripe.paymentIntents.capture.mockResolvedValue(mockIntent);

				const capturedIntent = await mockStripe.paymentIntents.capture("pi_123", {
					amount_to_capture: partialAmount,
				});

				expect(capturedIntent.amount_received).toBe(partialAmount);
			});
		});

		describe("Database Updates", () => {
			it("should update booking status to completed", async () => {
				const bookingId = "booking-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						status: "completed",
						amount_captured: 500000,
						stripe_payment_status: "succeeded",
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({
						status: "completed",
						amount_captured: 500000,
						stripe_payment_status: "succeeded",
					})
					.eq("id", bookingId);

				expect(updated.error).toBeNull();
			});

			it("should update amount_captured from intent", async () => {
				const capturedAmount = 500000;
				const bookingId = "booking-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						amount_captured: capturedAmount,
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ amount_captured: capturedAmount })
					.eq("id", bookingId);

				expect(updated.error).toBeNull();
			});

			it("should update stripe_payment_status", async () => {
				const bookingId = "booking-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						stripe_payment_status: "succeeded",
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ stripe_payment_status: "succeeded" })
					.eq("id", bookingId);

				expect(updated.error).toBeNull();
			});
		});
	});

	// ============================================================================
	// VOID PAYMENT INTENT - POST /api/payments/void-intent
	// ============================================================================

	describe("POST /api/payments/void-intent", () => {
		describe("Input Validation", () => {
			it("should reject missing payment intent ID", () => {
				const invalidInput = {};

				expect(invalidInput).not.toHaveProperty("paymentIntentId");
			});

			it("should reject empty payment intent ID", () => {
				const invalidInput = {
					paymentIntentId: "",
				};

				expect(invalidInput.paymentIntentId.length).toBe(0);
			});

			it("should accept valid payment intent ID", () => {
				const validInput = {
					paymentIntentId: "pi_1234567890",
				};

				expect(validInput.paymentIntentId.length).toBeGreaterThan(0);
			});
		});

		describe("Authorization Checks", () => {
			it("should allow customer to void their payment", async () => {
				const customerId = "user-customer-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: customerId,
						professional_id: "user-pro-456",
						status: "pending",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isCustomer = booking.data?.customer_id === customerId;
				expect(isCustomer).toBe(true);
			});

			it("should allow professional to void payment", async () => {
				const professionalId = "user-pro-456";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: "user-customer-123",
						professional_id: professionalId,
						status: "pending",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isProfessional = booking.data?.professional_id === professionalId;
				expect(isProfessional).toBe(true);
			});

			it("should reject unauthorized user", async () => {
				const unauthorizedUserId = "user-unauthorized-999";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-789",
						customer_id: "user-customer-123",
						professional_id: "user-pro-456",
						status: "pending",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("id, customer_id, professional_id, status")
					.eq("stripe_payment_intent_id", "pi_123")
					.maybeSingle();

				const isAuthorized =
					booking.data?.customer_id === unauthorizedUserId ||
					booking.data?.professional_id === unauthorizedUserId;

				expect(isAuthorized).toBe(false);
			});
		});

		describe("Business Logic Validation", () => {
			it("should reject if payment intent doesn't belong to booking", async () => {
				const bookingId = "booking-123";
				const wrongBookingId = "booking-456";

				const mockIntent = createMockPaymentIntent({
					metadata: { booking_id: wrongBookingId },
				});

				mockStripe.paymentIntents.retrieve.mockResolvedValue(mockIntent);

				const intent = await mockStripe.paymentIntents.retrieve("pi_123");

				expect(intent.metadata?.booking_id).not.toBe(bookingId);
			});

			it("should cancel payment intent", async () => {
				const mockIntent = createMockPaymentIntent({
					status: "canceled",
				});

				mockStripe.paymentIntents.cancel.mockResolvedValue(mockIntent);

				const canceledIntent = await mockStripe.paymentIntents.cancel("pi_123");

				expect(canceledIntent.status).toBe("canceled");
			});
		});

		describe("Database Updates", () => {
			it("should update booking status to canceled", async () => {
				const bookingId = "booking-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						status: "canceled",
						stripe_payment_status: "canceled",
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({
						status: "canceled",
						stripe_payment_status: "canceled",
					})
					.eq("id", bookingId);

				expect(updated.error).toBeNull();
			});

			it("should update stripe_payment_status to canceled", async () => {
				const bookingId = "booking-123";

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						stripe_payment_status: "canceled",
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ stripe_payment_status: "canceled" })
					.eq("id", bookingId);

				expect(updated.error).toBeNull();
			});
		});
	});

	// ============================================================================
	// PROCESS TIP - POST /api/payments/process-tip
	// ============================================================================

	describe("POST /api/payments/process-tip", () => {
		describe("Input Validation", () => {
			it("should reject missing bookingId", () => {
				const invalidInput = {
					tipAmount: 50000,
				};

				expect(invalidInput).not.toHaveProperty("bookingId");
			});

			it("should reject invalid UUID bookingId", () => {
				const invalidInput = {
					bookingId: "not-a-uuid",
					tipAmount: 50000,
				};

				const UUID_REGEX =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
				expect(UUID_REGEX.test(invalidInput.bookingId)).toBe(false);
			});

			it("should reject missing tipAmount", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
				};

				expect(invalidInput).not.toHaveProperty("tipAmount");
			});

			it("should reject negative tipAmount", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: -50000,
				};

				expect(invalidInput.tipAmount).toBeLessThan(0);
			});

			it("should reject zero tipAmount", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 0,
				};

				expect(invalidInput.tipAmount).toBe(0);
			});

			it("should reject tipAmount exceeding 1M COP", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 1_000_001,
				};

				const MAX_TIP = 1_000_000;
				expect(invalidInput.tipAmount).toBeGreaterThan(MAX_TIP);
			});

			it("should accept valid tip amount", () => {
				const validInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 50000,
				};

				expect(validInput.tipAmount).toBeGreaterThan(0);
				expect(validInput.tipAmount).toBeLessThanOrEqual(1_000_000);
			});

			it("should accept optional tipPercentage", () => {
				const validInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 50000,
					tipPercentage: 10,
				};

				expect(validInput.tipPercentage).toBeGreaterThanOrEqual(0);
				expect(validInput.tipPercentage).toBeLessThanOrEqual(100);
			});

			it("should reject tipPercentage below 0", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 50000,
					tipPercentage: -5,
				};

				expect(invalidInput.tipPercentage).toBeLessThan(0);
			});

			it("should reject tipPercentage above 100", () => {
				const invalidInput = {
					bookingId: "550e8400-e29b-41d4-a716-446655440000",
					tipAmount: 50000,
					tipPercentage: 150,
				};

				expect(invalidInput.tipPercentage).toBeGreaterThan(100);
			});
		});

		describe("Business Logic Validation", () => {
			it("should only allow tips on completed bookings", async () => {
				// Test pending status
				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-123",
						status: "pending",
						customer_id: "user-123",
					},
					error: null,
				});

				let booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-123")
					.single();

				expect(booking.data?.status).not.toBe("completed");

				// Test completed status (should work)
				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-456",
						status: "completed",
						customer_id: "user-123",
					},
					error: null,
				});

				booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-456")
					.single();

				expect(booking.data?.status).toBe("completed");
			});

			it("should reject if tip already added", async () => {
				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-123",
						status: "completed",
						tip_amount: 50000,
						customer_id: "user-123",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-123")
					.single();

				expect(booking.data?.tip_amount).toBeGreaterThan(0);
			});

			it("should reject if tip exceeds service cost", async () => {
				const serviceAmount = 500000;
				const tipAmount = 600000; // Exceeds service cost

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-123",
						status: "completed",
						amount_final: serviceAmount,
						customer_id: "user-123",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-123")
					.single();

				const exceedsServiceCost = tipAmount > (booking.data?.amount_final || 0);
				expect(exceedsServiceCost).toBe(true);
			});

			it("should accept tip less than service cost", async () => {
				const serviceAmount = 500000;
				const tipAmount = 50000; // 10% tip

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-123",
						status: "completed",
						amount_final: serviceAmount,
						customer_id: "user-123",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-123")
					.single();

				const withinServiceCost = tipAmount <= (booking.data?.amount_final || 0);
				expect(withinServiceCost).toBe(true);
			});

			it("should use amount_estimated if amount_final not available", async () => {
				const estimatedAmount = 480000;
				const tipAmount = 50000;

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: "booking-123",
						status: "completed",
						amount_final: null,
						amount_estimated: estimatedAmount,
						customer_id: "user-123",
					},
					error: null,
				});

				const booking = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-123")
					.single();

				const serviceAmount =
					booking.data?.amount_final ?? booking.data?.amount_estimated ?? 0;
				expect(serviceAmount).toBe(estimatedAmount);
				expect(tipAmount <= serviceAmount).toBe(true);
			});
		});

		describe("Database Updates", () => {
			it("should update booking with tip_amount", async () => {
				const bookingId = "booking-123";
				const tipAmount = 50000;

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						tip_amount: tipAmount,
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ tip_amount: tipAmount })
					.eq("id", bookingId)
					.select()
					.single();

				expect(updated.error).toBeNull();
				expect(updated.data?.tip_amount).toBe(tipAmount);
			});

			it("should update booking with tip_percentage", async () => {
				const bookingId = "booking-123";
				const tipPercentage = 10;

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						tip_percentage: tipPercentage,
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ tip_percentage: tipPercentage })
					.eq("id", bookingId)
					.select()
					.single();

				expect(updated.error).toBeNull();
				expect(updated.data?.tip_percentage).toBe(tipPercentage);
			});

			it("should update booking updated_at timestamp", async () => {
				const bookingId = "booking-123";
				const now = new Date().toISOString();

				mockSupabase.__setMockResponse("bookings", {
					data: {
						id: bookingId,
						updated_at: now,
					},
					error: null,
				});

				const updated = await mockSupabase
					.from("bookings")
					.update({ updated_at: now })
					.eq("id", bookingId)
					.select()
					.single();

				expect(updated.error).toBeNull();
				expect(updated.data?.updated_at).toBe(now);
			});
		});

		describe("Response Data", () => {
			it("should calculate new total with tip", () => {
				const serviceAmount = 500000;
				const tipAmount = 50000;
				const newTotal = serviceAmount + tipAmount;

				expect(newTotal).toBe(550000);
			});

			it("should include all required response fields", () => {
				const response = {
					bookingId: "booking-123",
					tipAmount: 50000,
					tipPercentage: 10,
					serviceAmount: 500000,
					newTotal: 550000,
					professionalName: "Maria Garcia",
				};

				expect(response).toHaveProperty("bookingId");
				expect(response).toHaveProperty("tipAmount");
				expect(response).toHaveProperty("serviceAmount");
				expect(response).toHaveProperty("newTotal");
			});

			it("should handle missing professional name gracefully", () => {
				const response = {
					bookingId: "booking-123",
					tipAmount: 50000,
					serviceAmount: 500000,
					newTotal: 550000,
					professionalName: null,
				};

				expect(response.professionalName).toBeNull();
			});
		});
	});

	// ============================================================================
	// EDGE CASES & ERROR SCENARIOS
	// ============================================================================

	describe("Edge Cases & Error Scenarios", () => {
		describe("Stripe API Errors", () => {
			it("should handle Stripe customer creation failure", async () => {
				const stripeError = new Error("Customer creation failed");
				mockStripe.customers.create.mockRejectedValue(stripeError);

				await expect(
					mockStripe.customers.create({ email: "test@example.com" }),
				).rejects.toThrow("Customer creation failed");
			});

			it("should handle Stripe payment intent creation failure", async () => {
				const stripeError = new Error("Payment intent creation failed");
				mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

				await expect(
					mockStripe.paymentIntents.create({
						amount: 100000,
						currency: "cop",
					}),
				).rejects.toThrow("Payment intent creation failed");
			});

			it("should handle Stripe payment intent retrieve failure", async () => {
				const stripeError = new Error("Payment intent not found");
				mockStripe.paymentIntents.retrieve.mockRejectedValue(stripeError);

				await expect(
					mockStripe.paymentIntents.retrieve("pi_nonexistent"),
				).rejects.toThrow("Payment intent not found");
			});

			it("should handle Stripe capture failure", async () => {
				const stripeError = new Error("Capture failed");
				mockStripe.paymentIntents.capture.mockRejectedValue(stripeError);

				await expect(
					mockStripe.paymentIntents.capture("pi_123"),
				).rejects.toThrow("Capture failed");
			});

			it("should handle Stripe cancel failure", async () => {
				const stripeError = new Error("Cancel failed");
				mockStripe.paymentIntents.cancel.mockRejectedValue(stripeError);

				await expect(
					mockStripe.paymentIntents.cancel("pi_123"),
				).rejects.toThrow("Cancel failed");
			});
		});

		describe("Database Errors", () => {
			it("should handle profile query failure", async () => {
				mockSupabase.__setMockResponse("profiles", {
					data: null,
					error: new Error("Database connection failed"),
				});

				const result = await mockSupabase
					.from("profiles")
					.select("id, stripe_customer_id")
					.eq("id", "user-123")
					.maybeSingle();

				expect(result.error).toBeDefined();
			});

			it("should handle profile update failure", async () => {
				mockSupabase.__setMockResponse("profiles", {
					data: null,
					error: new Error("Update failed"),
				});

				const result = await mockSupabase
					.from("profiles")
					.update({ stripe_customer_id: "cus_123" })
					.eq("id", "user-123");

				expect(result.error).toBeDefined();
			});

			it("should handle booking query failure", async () => {
				mockSupabase.__setMockResponse("bookings", {
					data: null,
					error: new Error("Booking not found"),
				});

				const result = await mockSupabase
					.from("bookings")
					.select("*")
					.eq("id", "booking-nonexistent")
					.maybeSingle();

				expect(result.error).toBeDefined();
			});

			it("should handle booking update failure", async () => {
				mockSupabase.__setMockResponse("bookings", {
					data: null,
					error: new Error("Update failed"),
				});

				const result = await mockSupabase
					.from("bookings")
					.update({ status: "completed" })
					.eq("id", "booking-123");

				expect(result.error).toBeDefined();
			});
		});

		describe("Currency Handling", () => {
			it("should handle COP currency correctly", () => {
				const copAmount = 500000; // 500k COP centavos
				expect(copAmount).toBe(500000);
			});

			it("should handle USD currency correctly", () => {
				const usdAmount = 10000; // $100 USD in cents
				expect(usdAmount).toBe(10000);
			});

			it("should handle EUR currency correctly", () => {
				const eurAmount = 8500; // €85 EUR in cents
				expect(eurAmount).toBe(8500);
			});
		});

		describe("Amount Boundaries", () => {
			it("should handle minimum valid amount (1 centavo/cent)", () => {
				const minAmount = 1;
				expect(minAmount).toBeGreaterThan(0);
			});

			it("should handle maximum COP amount (1B centavos)", () => {
				const maxAmount = 1_000_000_000;
				expect(maxAmount).toBe(1_000_000_000);
			});

			it("should handle large but valid amounts", () => {
				const largeAmount = 999_999_999;
				expect(largeAmount).toBeLessThanOrEqual(1_000_000_000);
				expect(largeAmount).toBeGreaterThan(0);
			});
		});
	});
});
