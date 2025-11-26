/**
 * Email Send Module Unit Tests
 *
 * Tests all email sending functions:
 * - Booking request/confirmation/declined emails
 * - Reminder and notification emails
 * - Account suspension/restoration emails
 * - Professional application emails
 * - Background check notification emails
 * - Error handling and edge cases
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

// Mock the resend client before importing the module
const mockSend = mock(() => Promise.resolve({ id: "mock-email-id" }));

// Mock module (Bun-style mocking)
mock.module("../client", () => ({
  resend: {
    emails: {
      send: mockSend,
    },
  },
}));

// Import after mocking
import {
  sendAccountRestorationEmail,
  sendAccountSuspensionEmail,
  sendBackgroundCheckCompletedEmail,
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
  sendBookingReminderEmail,
  sendBookingRescheduleEmail,
  sendEmail,
  sendMessageNotificationEmail,
  sendNewBookingRequestEmail,
  sendProfessionalApprovedEmail,
  sendProfessionalInfoRequestedEmail,
  sendProfessionalRejectedEmail,
  sendServiceCompletedEmail,
} from "../send";

// ========================================
// Test Data Fixtures
// ========================================

const mockBookingData = {
  customerName: "María García",
  professionalName: "Carlos López",
  serviceName: "Deep Cleaning",
  scheduledDate: "2025-01-20",
  scheduledTime: "10:00 AM",
  duration: "4 hours",
  address: "Calle 123 #45-67, Bogotá",
  bookingId: "booking-123-abc",
  amount: "$120,000 COP",
};

describe("Email Send Module", () => {
  beforeEach(() => {
    // Reset mock before each test
    mockSend.mockReset();
    mockSend.mockImplementation(() => Promise.resolve({ id: "mock-email-id" }));
  });

  afterEach(() => {
    mockSend.mockReset();
  });

  // ========================================
  // Booking Request Email Tests
  // ========================================

  describe("sendNewBookingRequestEmail", () => {
    it("should send booking request email to professional", async () => {
      const result = await sendNewBookingRequestEmail("professional@example.com", mockBookingData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should include customer name in subject", async () => {
      await sendNewBookingRequestEmail("pro@example.com", mockBookingData);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.customerName);
    });

    it("should handle send errors gracefully", async () => {
      mockSend.mockImplementation(() => Promise.reject(new Error("Network error")));

      const result = await sendNewBookingRequestEmail("professional@example.com", mockBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should handle non-Error exceptions", async () => {
      mockSend.mockImplementation(() => Promise.reject("String error"));

      const result = await sendNewBookingRequestEmail("professional@example.com", mockBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });
  });

  // ========================================
  // Booking Confirmed Email Tests
  // ========================================

  describe("sendBookingConfirmedEmail", () => {
    it("should send confirmation email to customer", async () => {
      const result = await sendBookingConfirmedEmail("customer@example.com", mockBookingData);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should include professional name in subject", async () => {
      await sendBookingConfirmedEmail("customer@example.com", mockBookingData);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.professionalName);
    });

    it("should handle send errors", async () => {
      mockSend.mockImplementation(() => Promise.reject(new Error("SMTP error")));

      const result = await sendBookingConfirmedEmail("customer@example.com", mockBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("SMTP error");
    });
  });

  // ========================================
  // Booking Declined Email Tests
  // ========================================

  describe("sendBookingDeclinedEmail", () => {
    it("should send declined email without reason", async () => {
      const result = await sendBookingDeclinedEmail("customer@example.com", mockBookingData);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should send declined email with reason", async () => {
      const result = await sendBookingDeclinedEmail(
        "customer@example.com",
        mockBookingData,
        "Schedule conflict"
      );

      expect(result.success).toBe(true);
    });

    it("should include professional name in subject", async () => {
      await sendBookingDeclinedEmail("customer@example.com", mockBookingData);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.professionalName);
    });
  });

  // ========================================
  // Booking Reminder Email Tests
  // ========================================

  describe("sendBookingReminderEmail", () => {
    it("should send reminder to customer", async () => {
      const result = await sendBookingReminderEmail("customer@example.com", mockBookingData, false);

      expect(result.success).toBe(true);
    });

    it("should send reminder to professional", async () => {
      const result = await sendBookingReminderEmail(
        "professional@example.com",
        mockBookingData,
        true
      );

      expect(result.success).toBe(true);
    });

    it("should include service name in subject", async () => {
      await sendBookingReminderEmail("customer@example.com", mockBookingData, false);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.serviceName);
    });
  });

  // ========================================
  // Message Notification Email Tests
  // ========================================

  describe("sendMessageNotificationEmail", () => {
    it("should send notification to customer", async () => {
      const result = await sendMessageNotificationEmail(
        "customer@example.com",
        "María",
        "Carlos",
        "Hello! Just confirming...",
        "booking-123",
        false
      );

      expect(result.success).toBe(true);
    });

    it("should send notification to professional", async () => {
      const result = await sendMessageNotificationEmail(
        "professional@example.com",
        "Carlos",
        "María",
        "Hi! Can you arrive at 10am?",
        "booking-123",
        true
      );

      expect(result.success).toBe(true);
    });

    it("should include sender name in subject", async () => {
      await sendMessageNotificationEmail(
        "customer@example.com",
        "María",
        "Carlos",
        "Message preview",
        "booking-123",
        false
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Carlos");
    });
  });

  // ========================================
  // Service Completed Email Tests
  // ========================================

  describe("sendServiceCompletedEmail", () => {
    it("should send completion email to customer", async () => {
      const result = await sendServiceCompletedEmail(
        "customer@example.com",
        mockBookingData,
        false
      );

      expect(result.success).toBe(true);
    });

    it("should send completion email to professional", async () => {
      const result = await sendServiceCompletedEmail(
        "professional@example.com",
        mockBookingData,
        true
      );

      expect(result.success).toBe(true);
    });

    it("should include service name in subject", async () => {
      await sendServiceCompletedEmail("customer@example.com", mockBookingData, false);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.serviceName);
    });
  });

  // ========================================
  // Account Suspension Email Tests
  // ========================================

  describe("sendAccountSuspensionEmail", () => {
    it("should send temporary suspension email", async () => {
      const result = await sendAccountSuspensionEmail(
        "user@example.com",
        "John Doe",
        "Violation of terms",
        "2025-02-01",
        7
      );

      expect(result.success).toBe(true);
    });

    it("should send permanent ban email", async () => {
      const result = await sendAccountSuspensionEmail(
        "user@example.com",
        "John Doe",
        "Repeated violations",
        null
      );

      expect(result.success).toBe(true);
    });

    it("should use suspension subject for temporary suspension", async () => {
      await sendAccountSuspensionEmail("user@example.com", "John", "Reason", "2025-02-01", 7);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Suspended");
    });

    it("should use ban subject for permanent ban", async () => {
      await sendAccountSuspensionEmail("user@example.com", "John", "Reason", null);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Banned");
    });
  });

  // ========================================
  // Account Restoration Email Tests
  // ========================================

  describe("sendAccountRestorationEmail", () => {
    it("should send restoration email", async () => {
      const result = await sendAccountRestorationEmail(
        "user@example.com",
        "John Doe",
        "Suspension period ended"
      );

      expect(result.success).toBe(true);
    });

    it("should include restoration subject", async () => {
      await sendAccountRestorationEmail("user@example.com", "John", "Reason");

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Restored");
    });
  });

  // ========================================
  // Booking Reschedule Email Tests
  // ========================================

  describe("sendBookingRescheduleEmail", () => {
    it("should send reschedule email to customer", async () => {
      const result = await sendBookingRescheduleEmail(
        "customer@example.com",
        mockBookingData,
        "2025-01-25",
        "2:00 PM",
        false
      );

      expect(result.success).toBe(true);
    });

    it("should send reschedule email to professional", async () => {
      const result = await sendBookingRescheduleEmail(
        "professional@example.com",
        mockBookingData,
        "2025-01-25",
        "2:00 PM",
        true
      );

      expect(result.success).toBe(true);
    });

    it("should include service name in subject", async () => {
      await sendBookingRescheduleEmail(
        "customer@example.com",
        mockBookingData,
        "2025-01-25",
        "2:00 PM",
        false
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain(mockBookingData.serviceName);
    });
  });

  // ========================================
  // Professional Application Emails
  // ========================================

  describe("sendProfessionalApprovedEmail", () => {
    it("should send approval email without notes", async () => {
      const result = await sendProfessionalApprovedEmail("pro@example.com", "Carlos López");

      expect(result.success).toBe(true);
    });

    it("should send approval email with notes", async () => {
      const result = await sendProfessionalApprovedEmail(
        "pro@example.com",
        "Carlos López",
        "Welcome aboard! Complete your profile."
      );

      expect(result.success).toBe(true);
    });

    it("should include approval subject", async () => {
      await sendProfessionalApprovedEmail("pro@example.com", "Carlos");

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Approved");
    });
  });

  describe("sendProfessionalRejectedEmail", () => {
    it("should send rejection email without notes", async () => {
      const result = await sendProfessionalRejectedEmail(
        "pro@example.com",
        "Carlos López",
        "Incomplete documentation"
      );

      expect(result.success).toBe(true);
    });

    it("should send rejection email with notes", async () => {
      const result = await sendProfessionalRejectedEmail(
        "pro@example.com",
        "Carlos López",
        "Background check failed",
        "Please contact support for more details."
      );

      expect(result.success).toBe(true);
    });
  });

  describe("sendProfessionalInfoRequestedEmail", () => {
    it("should send info request email without notes", async () => {
      const result = await sendProfessionalInfoRequestedEmail("pro@example.com", "Carlos López");

      expect(result.success).toBe(true);
    });

    it("should send info request email with notes", async () => {
      const result = await sendProfessionalInfoRequestedEmail(
        "pro@example.com",
        "Carlos López",
        "Please upload your ID document."
      );

      expect(result.success).toBe(true);
    });

    it("should include info request subject", async () => {
      await sendProfessionalInfoRequestedEmail("pro@example.com", "Carlos");

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Additional Information");
    });
  });

  // ========================================
  // Background Check Email Tests
  // ========================================

  describe("sendBackgroundCheckCompletedEmail", () => {
    it("should send clear status with approved recommendation", async () => {
      const result = await sendBackgroundCheckCompletedEmail(
        "pro@example.com",
        "Carlos López",
        "clear",
        "approved"
      );

      expect(result.success).toBe(true);
    });

    it("should send consider status with review required", async () => {
      const result = await sendBackgroundCheckCompletedEmail(
        "pro@example.com",
        "Carlos López",
        "consider",
        "review_required"
      );

      expect(result.success).toBe(true);
    });

    it("should send suspended status with rejected recommendation", async () => {
      const result = await sendBackgroundCheckCompletedEmail(
        "pro@example.com",
        "Carlos López",
        "suspended",
        "rejected"
      );

      expect(result.success).toBe(true);
    });

    it("should use success checkmark for clear/approved", async () => {
      await sendBackgroundCheckCompletedEmail("pro@example.com", "Carlos", "clear", "approved");

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("✓");
    });

    it("should mention manual review for consider status", async () => {
      await sendBackgroundCheckCompletedEmail(
        "pro@example.com",
        "Carlos",
        "consider",
        "review_required"
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain("Manual Review");
    });
  });

  // ========================================
  // Generic Send Email Tests
  // ========================================

  describe("sendEmail", () => {
    it("should send generic email", async () => {
      const result = await sendEmail(
        "user@example.com",
        "Custom Subject",
        "<p>Custom HTML content</p>"
      );

      expect(result.success).toBe(true);
    });

    it("should pass correct parameters to resend", async () => {
      await sendEmail("test@example.com", "Test Subject", "<p>Test</p>");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test Subject",
          html: "<p>Test</p>",
        })
      );
    });

    it("should handle errors", async () => {
      mockSend.mockImplementation(() => Promise.reject(new Error("Failed")));

      const result = await sendEmail("test@example.com", "Subject", "<p>Content</p>");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed");
    });
  });

  // ========================================
  // Error Handling Edge Cases
  // ========================================

  describe("Error Handling", () => {
    it("should handle undefined error objects", async () => {
      mockSend.mockImplementation(() => Promise.reject(undefined));

      const result = await sendEmail("test@example.com", "Subject", "Content");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should handle null error objects", async () => {
      mockSend.mockImplementation(() => Promise.reject(null));

      const result = await sendEmail("test@example.com", "Subject", "Content");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should handle object error without message", async () => {
      mockSend.mockImplementation(() => Promise.reject({ code: 500 }));

      const result = await sendEmail("test@example.com", "Subject", "Content");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });
  });
});
