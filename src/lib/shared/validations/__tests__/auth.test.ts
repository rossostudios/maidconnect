/**
 * Authentication & Profile Validation Tests
 *
 * Comprehensive tests for user authentication, profile management, and account operations.
 * Validates all Zod schemas in auth.ts to ensure data integrity across the auth flow.
 *
 * @module lib/shared/validations/__tests__/auth.test.ts
 */

import { describe, expect, test as it } from "bun:test";
import {
  accountStatusSchema,
  // Profile Schemas
  baseProfileSchema,
  customerProfileSchema,
  // Account Management
  deleteAccountSchema,
  exportDataSchema,
  // Admin Operations
  moderateUserSchema,
  professionalProfileSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signInSchema,
  // Authentication Schemas
  signUpSchema,
  updateBaseProfileSchema,
  updateCustomerProfileSchema,
  updatePasswordSchema,
  updateProfessionalProfileSchema,
  updateUserRoleSchema,
  // Enums
  userRoleSchema,
  // Verification
  verifyEmailSchema,
  verifyPhoneSchema,
} from "../auth";

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

describe("userRoleSchema", () => {
  it("should accept valid roles", () => {
    expect(userRoleSchema.safeParse("customer").success).toBe(true);
    expect(userRoleSchema.safeParse("professional").success).toBe(true);
    expect(userRoleSchema.safeParse("admin").success).toBe(true);
  });

  it("should reject invalid roles", () => {
    expect(userRoleSchema.safeParse("user").success).toBe(false);
    expect(userRoleSchema.safeParse("manager").success).toBe(false);
    expect(userRoleSchema.safeParse("").success).toBe(false);
  });
});

describe("accountStatusSchema", () => {
  it("should accept valid statuses", () => {
    expect(accountStatusSchema.safeParse("active").success).toBe(true);
    expect(accountStatusSchema.safeParse("suspended").success).toBe(true);
    expect(accountStatusSchema.safeParse("deactivated").success).toBe(true);
  });

  it("should reject invalid statuses", () => {
    expect(accountStatusSchema.safeParse("deleted").success).toBe(false);
    expect(accountStatusSchema.safeParse("pending").success).toBe(false);
    expect(accountStatusSchema.safeParse("").success).toBe(false);
  });
});

// ============================================================================
// BASE PROFILE SCHEMA
// ============================================================================

describe("baseProfileSchema", () => {
  const validProfile = {
    displayName: "John Doe",
    bio: "Experienced professional",
    phoneNumber: "+573001234567",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  it("should accept valid profile with all fields", () => {
    const result = baseProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("should accept profile with only required fields", () => {
    const result = baseProfileSchema.safeParse({
      displayName: "Jane Smith",
    });
    expect(result.success).toBe(true);
  });

  it("should reject displayName shorter than 2 characters", () => {
    const result = baseProfileSchema.safeParse({
      displayName: "A",
    });
    expect(result.success).toBe(false);
  });

  it("should reject displayName longer than 100 characters", () => {
    const result = baseProfileSchema.safeParse({
      displayName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should reject bio longer than 1000 characters", () => {
    const result = baseProfileSchema.safeParse({
      displayName: "John Doe",
      bio: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid URL for avatarUrl", () => {
    const result = baseProfileSchema.safeParse({
      displayName: "John Doe",
      avatarUrl: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing displayName", () => {
    const result = baseProfileSchema.safeParse({
      bio: "Some bio",
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PROFESSIONAL PROFILE SCHEMA
// ============================================================================

describe("professionalProfileSchema", () => {
  const validProfessional = {
    role: "professional" as const,
    displayName: "Maria Garcia",
    hourlyRate: 50_000,
    yearsExperience: 5,
    serviceRadius: 10,
    languages: ["Spanish", "English"],
    specialties: ["Deep Cleaning", "Laundry"],
    certifications: ["First Aid Certificate"],
    availability: {
      monday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    },
    acceptingNewClients: true,
  };

  it("should accept valid professional profile with all fields", () => {
    const result = professionalProfileSchema.safeParse(validProfessional);
    expect(result.success).toBe(true);
  });

  it("should accept profile without optional fields", () => {
    const result = professionalProfileSchema.safeParse({
      role: "professional",
      displayName: "Maria Garcia",
      hourlyRate: 50_000,
      yearsExperience: 5,
      serviceRadius: 10,
      languages: ["Spanish"],
      specialties: ["Cleaning"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject role other than professional", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      role: "customer",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative hourlyRate", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      hourlyRate: -1000,
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero hourlyRate", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      hourlyRate: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject yearsExperience below 0", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      yearsExperience: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject yearsExperience above 50", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      yearsExperience: 51,
    });
    expect(result.success).toBe(false);
  });

  it("should reject serviceRadius above 100km", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      serviceRadius: 101,
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty languages array", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      languages: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 10 languages", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      languages: new Array(11).fill("Language"),
    });
    expect(result.success).toBe(false);
  });

  it("should reject language shorter than 2 characters", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      languages: ["A"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 20 certifications", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      certifications: new Array(21).fill("Certificate"),
    });
    expect(result.success).toBe(false);
  });

  it("should reject certification longer than 200 characters", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      certifications: ["A".repeat(201)],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty specialties array", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      specialties: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 10 specialties", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      specialties: new Array(11).fill("Specialty"),
    });
    expect(result.success).toBe(false);
  });

  it("should accept 0 years experience (beginner)", () => {
    const result = professionalProfileSchema.safeParse({
      ...validProfessional,
      yearsExperience: 0,
    });
    expect(result.success).toBe(true);
  });

  it("should default acceptingNewClients to true", () => {
    const result = professionalProfileSchema.safeParse({
      role: "professional",
      displayName: "Maria Garcia",
      hourlyRate: 50_000,
      yearsExperience: 5,
      serviceRadius: 10,
      languages: ["Spanish"],
      specialties: ["Cleaning"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.acceptingNewClients).toBe(true);
    }
  });
});

// ============================================================================
// CUSTOMER PROFILE SCHEMA
// ============================================================================

describe("customerProfileSchema", () => {
  const validCustomer = {
    role: "customer" as const,
    displayName: "Carlos Rodriguez",
    bio: "Looking for reliable household help",
    preferredLanguage: "es",
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
  };

  it("should accept valid customer profile with all fields", () => {
    const result = customerProfileSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it("should accept profile without optional fields", () => {
    const result = customerProfileSchema.safeParse({
      role: "customer",
      displayName: "Carlos Rodriguez",
    });
    expect(result.success).toBe(true);
  });

  it("should reject role other than customer", () => {
    const result = customerProfileSchema.safeParse({
      ...validCustomer,
      role: "professional",
    });
    expect(result.success).toBe(false);
  });

  it("should reject preferredLanguage not exactly 2 characters", () => {
    const result = customerProfileSchema.safeParse({
      ...validCustomer,
      preferredLanguage: "eng",
    });
    expect(result.success).toBe(false);
  });

  it("should default preferredLanguage to 'es'", () => {
    const result = customerProfileSchema.safeParse({
      role: "customer",
      displayName: "Carlos Rodriguez",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredLanguage).toBe("es");
    }
  });

  it("should default notification preferences correctly", () => {
    const result = customerProfileSchema.safeParse({
      role: "customer",
      displayName: "Carlos Rodriguez",
      notificationPreferences: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notificationPreferences?.email).toBe(true);
      expect(result.data.notificationPreferences?.push).toBe(true);
      expect(result.data.notificationPreferences?.sms).toBe(false);
    }
  });
});

// ============================================================================
// UPDATE PROFILE SCHEMAS
// ============================================================================

describe("updateBaseProfileSchema", () => {
  it("should accept profile with all optional fields", () => {
    const result = updateBaseProfileSchema.safeParse({
      displayName: "Updated Name",
      bio: "Updated bio",
      phoneNumber: "+573001234567",
      avatarUrl: "https://example.com/new-avatar.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object (all fields optional)", () => {
    const result = updateBaseProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid displayName length", () => {
    const result = updateBaseProfileSchema.safeParse({
      displayName: "A",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid URL", () => {
    const result = updateBaseProfileSchema.safeParse({
      avatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfessionalProfileSchema", () => {
  it("should accept professional updates with all fields", () => {
    const result = updateProfessionalProfileSchema.safeParse({
      displayName: "Updated Name",
      hourlyRate: 60_000,
      yearsExperience: 10,
      serviceRadius: 15,
      languages: ["Spanish", "English", "French"],
      certifications: ["Advanced Certification"],
      specialties: ["Deep Cleaning", "Organization"],
      acceptingNewClients: false,
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateProfessionalProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid hourlyRate", () => {
    const result = updateProfessionalProfileSchema.safeParse({
      hourlyRate: -1000,
    });
    expect(result.success).toBe(false);
  });

  it("should reject yearsExperience above limit", () => {
    const result = updateProfessionalProfileSchema.safeParse({
      yearsExperience: 51,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCustomerProfileSchema", () => {
  it("should accept customer updates with all fields", () => {
    const result = updateCustomerProfileSchema.safeParse({
      displayName: "Updated Name",
      bio: "Updated bio",
      preferredLanguage: "en",
      notificationPreferences: {
        email: false,
        push: true,
        sms: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateCustomerProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid preferredLanguage length", () => {
    const result = updateCustomerProfileSchema.safeParse({
      preferredLanguage: "eng",
    });
    expect(result.success).toBe(false);
  });

  it("should accept partial notification preferences", () => {
    const result = updateCustomerProfileSchema.safeParse({
      notificationPreferences: {
        email: false,
      },
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

describe("signUpSchema", () => {
  const validSignUp = {
    email: "test@example.com",
    password: "SecurePass123",
    displayName: "John Doe",
    role: "customer" as const,
  };

  it("should accept valid signup data", () => {
    const result = signUpSchema.safeParse(validSignUp);
    expect(result.success).toBe(true);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: "Short1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: "lowercase123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without lowercase letter", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: "UPPERCASE123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without number", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: "NoNumbersHere",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password longer than 100 characters", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: `${"A".repeat(50) + "a".repeat(50)}1`,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid role", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      role: "superuser",
    });
    expect(result.success).toBe(false);
  });

  it("should reject displayName shorter than 2 characters", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      displayName: "A",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("should accept valid signin data", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing email", () => {
    const result = signInSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordRequestSchema", () => {
  it("should accept valid email", () => {
    const result = resetPasswordRequestSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = resetPasswordRequestSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing email", () => {
    const result = resetPasswordRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const validReset = {
    token: "valid-reset-token-12345",
    newPassword: "NewSecure123",
  };

  it("should accept valid reset data", () => {
    const result = resetPasswordSchema.safeParse(validReset);
    expect(result.success).toBe(true);
  });

  it("should reject empty token", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      token: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without complexity requirements", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      newPassword: "simple",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      newPassword: "Short1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      newPassword: "lowercase123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without lowercase", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      newPassword: "UPPERCASE123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without number", () => {
    const result = resetPasswordSchema.safeParse({
      ...validReset,
      newPassword: "NoNumbers",
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  const validUpdate = {
    currentPassword: "OldPassword123",
    newPassword: "NewPassword456",
  };

  it("should accept valid password update", () => {
    const result = updatePasswordSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("should reject empty currentPassword", () => {
    const result = updatePasswordSchema.safeParse({
      ...validUpdate,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject newPassword without complexity", () => {
    const result = updatePasswordSchema.safeParse({
      ...validUpdate,
      newPassword: "simple",
    });
    expect(result.success).toBe(false);
  });

  it("should reject newPassword shorter than 8 characters", () => {
    const result = updatePasswordSchema.safeParse({
      ...validUpdate,
      newPassword: "Short1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing currentPassword", () => {
    const result = updatePasswordSchema.safeParse({
      newPassword: "NewPassword456",
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ACCOUNT MANAGEMENT SCHEMAS
// ============================================================================

describe("deleteAccountSchema", () => {
  it("should accept valid deletion request with all fields", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "MyPassword123",
      reason: "Moving to another country",
      feedback: "Great service, but I no longer need it",
    });
    expect(result.success).toBe(true);
  });

  it("should accept deletion with only password", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "MyPassword123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty confirmPassword", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject reason shorter than 10 characters", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "MyPassword123",
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject reason longer than 500 characters", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "MyPassword123",
      reason: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should reject feedback longer than 2000 characters", () => {
    const result = deleteAccountSchema.safeParse({
      confirmPassword: "MyPassword123",
      feedback: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing confirmPassword", () => {
    const result = deleteAccountSchema.safeParse({
      reason: "I want to delete my account",
    });
    expect(result.success).toBe(false);
  });
});

describe("exportDataSchema", () => {
  it("should accept export request with all fields", () => {
    const result = exportDataSchema.safeParse({
      includeBookings: true,
      includeMessages: true,
      includeProfile: true,
      includePayments: true,
      format: "json",
    });
    expect(result.success).toBe(true);
  });

  it("should accept export with CSV format", () => {
    const result = exportDataSchema.safeParse({
      includeBookings: true,
      includeMessages: false,
      includeProfile: true,
      includePayments: false,
      format: "csv",
    });
    expect(result.success).toBe(true);
  });

  it("should default to all includes true and JSON format", () => {
    const result = exportDataSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.includeBookings).toBe(true);
      expect(result.data.includeMessages).toBe(true);
      expect(result.data.includeProfile).toBe(true);
      expect(result.data.includePayments).toBe(true);
      expect(result.data.format).toBe("json");
    }
  });

  it("should reject invalid format", () => {
    const result = exportDataSchema.safeParse({
      format: "xml",
    });
    expect(result.success).toBe(false);
  });

  it("should accept selective data export", () => {
    const result = exportDataSchema.safeParse({
      includeBookings: true,
      includeMessages: false,
      includeProfile: false,
      includePayments: false,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// ADMIN OPERATION SCHEMAS
// ============================================================================

describe("moderateUserSchema", () => {
  const validModeration = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    action: "suspend" as const,
    reason: "Violation of terms of service - inappropriate behavior",
    duration: 7,
  };

  it("should accept valid moderation with duration", () => {
    const result = moderateUserSchema.safeParse(validModeration);
    expect(result.success).toBe(true);
  });

  it("should accept moderation without duration", () => {
    const result = moderateUserSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      action: "warn",
      reason: "First warning for minor policy violation",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      userId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid action", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      action: "ban",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid actions", () => {
    expect(moderateUserSchema.safeParse({ ...validModeration, action: "suspend" }).success).toBe(
      true
    );
    expect(moderateUserSchema.safeParse({ ...validModeration, action: "activate" }).success).toBe(
      true
    );
    expect(moderateUserSchema.safeParse({ ...validModeration, action: "deactivate" }).success).toBe(
      true
    );
    expect(moderateUserSchema.safeParse({ ...validModeration, action: "warn" }).success).toBe(true);
  });

  it("should reject reason shorter than 10 characters", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject reason longer than 1000 characters", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      reason: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative duration", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      duration: -5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero duration", () => {
    const result = moderateUserSchema.safeParse({
      ...validModeration,
      duration: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserRoleSchema", () => {
  const validRoleUpdate = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    newRole: "professional" as const,
    reason: "User completed professional verification process",
  };

  it("should accept valid role update", () => {
    const result = updateUserRoleSchema.safeParse(validRoleUpdate);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const result = updateUserRoleSchema.safeParse({
      ...validRoleUpdate,
      userId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid role", () => {
    const result = updateUserRoleSchema.safeParse({
      ...validRoleUpdate,
      newRole: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid roles", () => {
    expect(
      updateUserRoleSchema.safeParse({ ...validRoleUpdate, newRole: "customer" }).success
    ).toBe(true);
    expect(
      updateUserRoleSchema.safeParse({ ...validRoleUpdate, newRole: "professional" }).success
    ).toBe(true);
    expect(updateUserRoleSchema.safeParse({ ...validRoleUpdate, newRole: "admin" }).success).toBe(
      true
    );
  });

  it("should reject reason shorter than 10 characters", () => {
    const result = updateUserRoleSchema.safeParse({
      ...validRoleUpdate,
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject reason longer than 500 characters", () => {
    const result = updateUserRoleSchema.safeParse({
      ...validRoleUpdate,
      reason: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing reason", () => {
    const result = updateUserRoleSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      newRole: "professional",
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// VERIFICATION SCHEMAS
// ============================================================================

describe("verifyEmailSchema", () => {
  it("should accept valid token", () => {
    const result = verifyEmailSchema.safeParse({
      token: "valid-email-verification-token-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty token", () => {
    const result = verifyEmailSchema.safeParse({
      token: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing token", () => {
    const result = verifyEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("verifyPhoneSchema", () => {
  it("should accept valid phone verification", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
      verificationCode: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject code not exactly 6 digits", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
      verificationCode: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject code longer than 6 digits", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
      verificationCode: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric code", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
      verificationCode: "ABC123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject code with special characters", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
      verificationCode: "12-345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone number", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "invalid-phone",
      verificationCode: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing phoneNumber", () => {
    const result = verifyPhoneSchema.safeParse({
      verificationCode: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing verificationCode", () => {
    const result = verifyPhoneSchema.safeParse({
      phoneNumber: "+573001234567",
    });
    expect(result.success).toBe(false);
  });
});
