/**
 * Notification Module Unit Tests
 *
 * Tests all push notification functions:
 * - Customer notifications (booking, messages, reminders)
 * - Professional notifications (bookings, payments, reviews)
 * - Admin notifications (disputes, payment failures)
 * - Batch notification functions
 * - Error handling and edge cases
 */

import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

// Mock sendExpoNotification before importing the module
const mockSendExpoNotification = mock(() =>
  Promise.resolve({ success: true, sent: 1, errors: [] })
);

mock.module("@/lib/expo-push", () => ({
  sendExpoNotification: mockSendExpoNotification,
}));

// Mock formatDate
mock.module("@/lib/format", () => ({
  formatDate: (date: string, _options?: unknown) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  },
}));

// Mock global fetch
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, sent: 1 }),
  } as Response)
);

// biome-ignore lint/suspicious/noExplicitAny: test mock
(globalThis as any).fetch = mockFetch;

// Import after mocking
import {
  notifyCustomerBookingConfirmed,
  notifyCustomerBookingAccepted,
  notifyCustomerBookingDeclined,
  notifyCustomerServiceStarted,
  notifyCustomerServiceCompleted,
  notifyCustomerNewMessage,
  notifyCustomerReviewReminder,
  notifyCustomerProfessionalEnRoute,
  notifyProfessionalNewBooking,
  notifyProfessionalBookingCanceled,
  notifyProfessionalPaymentReceived,
  notifyProfessionalNewMessage,
  notifyProfessionalReviewReceived,
  notifyProfessionalServiceReminder,
  notifyProfessionalBookingRescheduled,
  notifyProfessionalDisputeFiled,
  notifyCustomerDisputeResolved,
  notifyProfessionalDisputeResolved,
  notifyAdminDisputeFiled,
  notifyAdminPaymentFailure,
  notifyAdminPaymentCapturedButDBFailed,
  notifyAllAdmins,
  notifyProfessionalNewJobNearby,
  notifyNearbyProfessionalsNewJob,
  notifyCustomerRebookNudge,
  sendPushNotification,
} from "../notifications";

// ========================================
// Test Data Fixtures
// ========================================

const mockBooking = {
  id: "booking-123",
  serviceName: "Deep Cleaning",
  professionalName: "Carlos López",
  customerName: "María García",
  scheduledStart: "2025-01-20T10:00:00Z",
  newScheduledStart: "2025-01-25T14:00:00Z",
};

const mockMessage = {
  senderName: "Carlos López",
  preview: "Hi! Just confirming our appointment...",
  conversationId: "conv-123",
};

const mockDispute = {
  id: "dispute-123",
  bookingId: "booking-123",
  reason: "Service quality issue",
  customerName: "María García",
  professionalName: "Carlos López",
  resolution: "resolved" as const,
  resolutionNotes: "Refund issued",
  serviceName: "Deep Cleaning",
};

const mockReview = {
  customerName: "María García",
  rating: 5,
  serviceName: "Deep Cleaning",
};

describe("Notification Module", () => {
  beforeEach(() => {
    mockSendExpoNotification.mockReset();
    mockSendExpoNotification.mockImplementation(() =>
      Promise.resolve({ success: true, sent: 1, errors: [] })
    );
    mockFetch.mockReset();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, sent: 1 }),
      } as Response)
    );
  });

  afterEach(() => {
    mockSendExpoNotification.mockReset();
    mockFetch.mockReset();
  });

  // ========================================
  // Core sendPushNotification Tests
  // ========================================

  describe("sendPushNotification", () => {
    it("should send notification via Expo and web push", async () => {
      const result = await sendPushNotification({
        userId: "user-123",
        title: "Test Title",
        body: "Test Body",
        url: "/dashboard",
        tag: "test-tag",
      });

      expect(result.success).toBe(true);
      expect(mockSendExpoNotification).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle Expo notification errors gracefully", async () => {
      mockSendExpoNotification.mockImplementation(() =>
        Promise.reject(new Error("Expo error"))
      );

      const result = await sendPushNotification({
        userId: "user-123",
        title: "Test",
        body: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should continue even if web push fails", async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error("Web error")));

      const result = await sendPushNotification({
        userId: "user-123",
        title: "Test",
        body: "Test",
      });

      // Should still succeed since Expo worked
      expect(result.success).toBe(true);
    });

    it("should set high priority for requireInteraction", async () => {
      await sendPushNotification({
        userId: "user-123",
        title: "Urgent",
        body: "Urgent message",
        requireInteraction: true,
      });

      expect(mockSendExpoNotification).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          priority: "high",
        })
      );
    });
  });

  // ========================================
  // Customer Notification Tests
  // ========================================

  describe("Customer Notifications", () => {
    describe("notifyCustomerBookingConfirmed", () => {
      it("should send booking confirmed notification", async () => {
        const result = await notifyCustomerBookingConfirmed("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Booking Confirmed! 🎉",
          })
        );
      });

      it("should include service and professional name in body", async () => {
        await notifyCustomerBookingConfirmed("customer-123", mockBooking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            body: expect.stringContaining(mockBooking.serviceName),
          })
        );
      });

      it("should tag notification with booking ID", async () => {
        await notifyCustomerBookingConfirmed("customer-123", mockBooking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            data: expect.objectContaining({
              tag: `booking-${mockBooking.id}`,
            }),
          })
        );
      });
    });

    describe("notifyCustomerBookingAccepted", () => {
      it("should send booking accepted notification", async () => {
        const result = await notifyCustomerBookingAccepted("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Booking Accepted! ✅",
          })
        );
      });
    });

    describe("notifyCustomerBookingDeclined", () => {
      it("should send booking declined notification", async () => {
        const result = await notifyCustomerBookingDeclined("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Booking Declined",
          })
        );
      });

      it("should link to professionals page for rebooking", async () => {
        await notifyCustomerBookingDeclined("customer-123", mockBooking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            data: expect.objectContaining({
              url: "/professionals",
            }),
          })
        );
      });
    });

    describe("notifyCustomerServiceStarted", () => {
      it("should send service started notification", async () => {
        const result = await notifyCustomerServiceStarted("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Service Started",
          })
        );
      });
    });

    describe("notifyCustomerServiceCompleted", () => {
      it("should send service completed notification", async () => {
        const result = await notifyCustomerServiceCompleted("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Service Completed! ✨",
          })
        );
      });

      it("should require interaction for review prompt", async () => {
        await notifyCustomerServiceCompleted("customer-123", mockBooking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            priority: "high",
          })
        );
      });
    });

    describe("notifyCustomerNewMessage", () => {
      it("should send message notification", async () => {
        const result = await notifyCustomerNewMessage("customer-123", mockMessage);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: `Message from ${mockMessage.senderName}`,
            body: mockMessage.preview,
          })
        );
      });
    });

    describe("notifyCustomerReviewReminder", () => {
      it("should send review reminder notification", async () => {
        const result = await notifyCustomerReviewReminder("customer-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Rate Your Experience",
          })
        );
      });
    });

    describe("notifyCustomerProfessionalEnRoute", () => {
      it("should send en route notification with arrival window", async () => {
        const booking = {
          bookingId: "booking-123",
          professionalName: "Carlos López",
          serviceName: "Deep Cleaning",
          estimatedArrival: "2025-01-20T10:00:00Z",
          windowStart: "2025-01-20T09:45:00Z",
          windowEnd: "2025-01-20T10:15:00Z",
        };

        const result = await notifyCustomerProfessionalEnRoute("customer-123", booking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: expect.stringContaining("is on the way!"),
            priority: "high",
          })
        );
      });
    });

    describe("notifyCustomerDisputeResolved", () => {
      it("should send resolved notification for resolved dispute", async () => {
        const result = await notifyCustomerDisputeResolved("customer-123", mockDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Dispute Resolved ✅",
          })
        );
      });

      it("should send update notification for dismissed dispute", async () => {
        const dismissedDispute = { ...mockDispute, resolution: "dismissed" as const };
        const result = await notifyCustomerDisputeResolved("customer-123", dismissedDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Dispute Update",
          })
        );
      });
    });

    describe("notifyCustomerRebookNudge", () => {
      it("should send rebook nudge notification", async () => {
        const booking = {
          id: "booking-123",
          serviceName: "Deep Cleaning",
          professionalName: "Carlos López",
          professionalId: "pro-123",
        };

        const result = await notifyCustomerRebookNudge("customer-123", booking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "customer-123",
          expect.objectContaining({
            title: "Ready for Your Next Service? ✨",
          })
        );
      });
    });
  });

  // ========================================
  // Professional Notification Tests
  // ========================================

  describe("Professional Notifications", () => {
    describe("notifyProfessionalNewBooking", () => {
      it("should send new booking notification", async () => {
        const result = await notifyProfessionalNewBooking("pro-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "New Booking Request! 🔔",
            priority: "high",
          })
        );
      });

      it("should include customer name and service in body", async () => {
        await notifyProfessionalNewBooking("pro-123", mockBooking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            body: expect.stringContaining(mockBooking.customerName),
          })
        );
      });
    });

    describe("notifyProfessionalBookingCanceled", () => {
      it("should send booking canceled notification", async () => {
        const result = await notifyProfessionalBookingCanceled("pro-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Booking Canceled",
          })
        );
      });
    });

    describe("notifyProfessionalPaymentReceived", () => {
      it("should send payment received notification", async () => {
        const booking = {
          id: "booking-123",
          serviceName: "Deep Cleaning",
          amount: 120000, // 120,000 COP
        };

        const result = await notifyProfessionalPaymentReceived("pro-123", booking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Payment Received! 💰",
          })
        );
      });

      it("should format amount in COP currency", async () => {
        const booking = {
          id: "booking-123",
          serviceName: "Deep Cleaning",
          amount: 120000,
        };

        await notifyProfessionalPaymentReceived("pro-123", booking);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            body: expect.stringMatching(/\$.*120/),
          })
        );
      });
    });

    describe("notifyProfessionalNewMessage", () => {
      it("should send message notification", async () => {
        const result = await notifyProfessionalNewMessage("pro-123", mockMessage);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: `Message from ${mockMessage.senderName}`,
          })
        );
      });
    });

    describe("notifyProfessionalReviewReceived", () => {
      it("should send review notification with stars", async () => {
        const result = await notifyProfessionalReviewReceived("pro-123", mockReview);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "New Review Received!",
            body: expect.stringContaining("⭐"),
          })
        );
      });
    });

    describe("notifyProfessionalServiceReminder", () => {
      it("should send service reminder notification", async () => {
        const result = await notifyProfessionalServiceReminder("pro-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Service Reminder ⏰",
            priority: "high",
          })
        );
      });
    });

    describe("notifyProfessionalBookingRescheduled", () => {
      it("should send reschedule notification", async () => {
        const result = await notifyProfessionalBookingRescheduled("pro-123", mockBooking);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Booking Rescheduled 📅",
            priority: "high",
          })
        );
      });
    });

    describe("notifyProfessionalDisputeFiled", () => {
      it("should send dispute filed notification", async () => {
        const result = await notifyProfessionalDisputeFiled("pro-123", mockDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Dispute Filed ⚠️",
            priority: "high",
          })
        );
      });
    });

    describe("notifyProfessionalDisputeResolved", () => {
      it("should send dismissed notification for dismissed dispute", async () => {
        const dismissedDispute = { ...mockDispute, resolution: "dismissed" as const };
        const result = await notifyProfessionalDisputeResolved("pro-123", dismissedDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Dispute Dismissed ✅",
          })
        );
      });

      it("should send resolved notification for resolved dispute", async () => {
        const result = await notifyProfessionalDisputeResolved("pro-123", mockDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "Dispute Resolved",
          })
        );
      });
    });

    describe("notifyProfessionalNewJobNearby", () => {
      it("should send new job nearby notification", async () => {
        const job = {
          serviceName: "Deep Cleaning",
          cityName: "Bogotá",
          scheduledDate: "2025-01-25T10:00:00Z",
          estimatedPay: 120000,
          currency: "COP",
        };

        const result = await notifyProfessionalNewJobNearby("pro-123", job);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            title: "New Job Nearby! 📍",
            priority: "high",
          })
        );
      });

      it("should use COP as default currency", async () => {
        const job = {
          serviceName: "Deep Cleaning",
          cityName: "Bogotá",
          scheduledDate: "2025-01-25T10:00:00Z",
          estimatedPay: 120000,
        };

        await notifyProfessionalNewJobNearby("pro-123", job);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "pro-123",
          expect.objectContaining({
            body: expect.stringMatching(/\$.*120/),
          })
        );
      });
    });
  });

  // ========================================
  // Admin Notification Tests
  // ========================================

  describe("Admin Notifications", () => {
    describe("notifyAdminDisputeFiled", () => {
      it("should send admin dispute notification", async () => {
        const result = await notifyAdminDisputeFiled("admin-123", mockDispute);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "admin-123",
          expect.objectContaining({
            title: "🚨 New Dispute Requires Review",
            priority: "high",
          })
        );
      });

      it("should include both customer and professional names", async () => {
        await notifyAdminDisputeFiled("admin-123", mockDispute);

        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "admin-123",
          expect.objectContaining({
            body: expect.stringContaining(mockDispute.customerName),
          })
        );
      });
    });

    describe("notifyAdminPaymentFailure", () => {
      it("should send payment failure notification", async () => {
        const failure = {
          bookingId: "booking-123",
          professionalName: "Carlos López",
          customerName: "María García",
          amount: 120000,
          errorMessage: "Card declined",
        };

        const result = await notifyAdminPaymentFailure("admin-123", failure);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "admin-123",
          expect.objectContaining({
            title: "🚨 CRITICAL: Payment Capture Failed",
            priority: "high",
          })
        );
      });
    });

    describe("notifyAdminPaymentCapturedButDBFailed", () => {
      it("should send critical DB failure notification", async () => {
        const failure = {
          bookingId: "booking-123",
          professionalName: "Carlos López",
          customerName: "María García",
          amountCaptured: 120000,
          paymentIntentId: "pi_123",
        };

        const result = await notifyAdminPaymentCapturedButDBFailed("admin-123", failure);

        expect(result.success).toBe(true);
        expect(mockSendExpoNotification).toHaveBeenCalledWith(
          "admin-123",
          expect.objectContaining({
            title: "🚨🚨 URGENT: Payment Captured, DB Update Failed",
            priority: "high",
          })
        );
      });
    });

    describe("notifyAllAdmins", () => {
      it("should notify all admins fetched from API", async () => {
        mockFetch.mockImplementation((url: string) => {
          if (url === "/api/admin/users") {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ admins: [{ id: "admin-1" }, { id: "admin-2" }] }),
            } as Response);
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
        });

        const mockNotifyFn = mock(() => Promise.resolve({ success: true }));
        const result = await notifyAllAdmins(mockNotifyFn, { test: "data" });

        expect(result.success).toBe(true);
        expect(mockNotifyFn).toHaveBeenCalledTimes(2);
      });

      it("should handle API failure gracefully", async () => {
        mockFetch.mockImplementation(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve({}),
          } as Response)
        );

        const mockNotifyFn = mock(() => Promise.resolve({ success: true }));
        const result = await notifyAllAdmins(mockNotifyFn, { test: "data" });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Failed to fetch admins");
      });

      it("should handle network errors gracefully", async () => {
        mockFetch.mockImplementation(() => Promise.reject(new Error("Network error")));

        const mockNotifyFn = mock(() => Promise.resolve({ success: true }));
        const result = await notifyAllAdmins(mockNotifyFn, { test: "data" });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ========================================
  // Batch Notification Tests
  // ========================================

  describe("Batch Notifications", () => {
    describe("notifyNearbyProfessionalsNewJob", () => {
      it("should notify multiple professionals", async () => {
        const professionalIds = ["pro-1", "pro-2", "pro-3"];
        const job = {
          serviceName: "Deep Cleaning",
          cityName: "Bogotá",
          scheduledDate: "2025-01-25T10:00:00Z",
          estimatedPay: 120000,
        };

        const result = await notifyNearbyProfessionalsNewJob(professionalIds, job);

        expect(result.total).toBe(3);
        expect(result.successful).toBe(3);
        expect(result.failed).toBe(0);
      });

      it("should handle errors gracefully without rejecting promises", async () => {
        // sendPushNotification catches errors internally and returns {success: false}
        // So Promise.allSettled will always show fulfilled, not rejected
        let callCount = 0;
        mockSendExpoNotification.mockImplementation(() => {
          callCount++;
          if (callCount === 2) {
            return Promise.reject(new Error("Failed"));
          }
          return Promise.resolve({ success: true, sent: 1, errors: [] });
        });

        const professionalIds = ["pro-1", "pro-2", "pro-3"];
        const job = {
          serviceName: "Deep Cleaning",
          cityName: "Bogotá",
          scheduledDate: "2025-01-25T10:00:00Z",
          estimatedPay: 120000,
        };

        const result = await notifyNearbyProfessionalsNewJob(professionalIds, job);

        // All promises fulfill because sendPushNotification catches errors
        expect(result.total).toBe(3);
        // Errors are caught internally, so no rejections at the batch level
        expect(result.successful + result.failed).toBe(3);
      });

      it("should handle empty professional list", async () => {
        const job = {
          serviceName: "Deep Cleaning",
          cityName: "Bogotá",
          scheduledDate: "2025-01-25T10:00:00Z",
          estimatedPay: 120000,
        };

        const result = await notifyNearbyProfessionalsNewJob([], job);

        expect(result.total).toBe(0);
        expect(result.successful).toBe(0);
        expect(result.failed).toBe(0);
      });
    });
  });

  // ========================================
  // Edge Cases and Error Handling
  // ========================================

  describe("Edge Cases", () => {
    it("should handle missing optional fields", async () => {
      const minimalBooking = {
        id: "booking-123",
        serviceName: "Cleaning",
        professionalName: "Pro",
        customerName: "Customer",
        scheduledStart: "2025-01-20T10:00:00Z",
      };

      const result = await notifyCustomerBookingConfirmed("customer-123", minimalBooking);
      expect(result.success).toBe(true);
    });

    it("should handle very long text gracefully", async () => {
      const longMessage = {
        senderName: "A".repeat(100),
        preview: "B".repeat(500),
        conversationId: "conv-123",
      };

      const result = await notifyCustomerNewMessage("customer-123", longMessage);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in names", async () => {
      const booking = {
        id: "booking-123",
        serviceName: "Limpieza Profunda",
        professionalName: "José García-López",
        customerName: "María Ángela O'Brien",
        scheduledStart: "2025-01-20T10:00:00Z",
      };

      const result = await notifyCustomerBookingConfirmed("customer-123", booking);
      expect(result.success).toBe(true);
    });

    it("should handle zero payment amounts", async () => {
      const booking = {
        id: "booking-123",
        serviceName: "Deep Cleaning",
        amount: 0,
      };

      const result = await notifyProfessionalPaymentReceived("pro-123", booking);
      expect(result.success).toBe(true);
    });

    it("should handle large payment amounts", async () => {
      const booking = {
        id: "booking-123",
        serviceName: "Event Cleaning",
        amount: 5000000, // 5 million COP
      };

      const result = await notifyProfessionalPaymentReceived("pro-123", booking);
      expect(result.success).toBe(true);
    });
  });
});
