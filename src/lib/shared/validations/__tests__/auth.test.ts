import { describe, expect, it } from "vitest";
import {
  accountStatusSchema,
  baseProfileSchema,
  customerProfileSchema,
  deleteAccountSchema,
  exportDataSchema,
  moderateUserSchema,
  professionalProfileSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateCustomerProfileSchema,
  updatePasswordSchema,
  updateProfessionalProfileSchema,
  updateUserRoleSchema,
  userRoleSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
} from "../auth";

// ============================================================================
// USER ROLE ENUMS
// ============================================================================

describe("userRoleSchema", () => {
  it("accepts valid user roles", () => {
    expect(userRoleSchema.parse("customer")).toBe("customer");
    expect(userRoleSchema.parse("professional")).toBe("professional");
    expect(userRoleSchema.parse("admin")).toBe("admin");
  });

  it("rejects invalid roles", () => {
    const result = userRoleSchema.safeParse("superadmin");
    expect(result.success).toBe(false);
  });

  it("rejects empty or invalid types", () => {
    expect(userRoleSchema.safeParse("").success).toBe(false);
    expect(userRoleSchema.safeParse(null).success).toBe(false);
    expect(userRoleSchema.safeParse(123).success).toBe(false);
  });
});

describe("accountStatusSchema", () => {
  it("accepts valid account statuses", () => {
    expect(accountStatusSchema.parse("active")).toBe("active");
    expect(accountStatusSchema.parse("suspended")).toBe("suspended");
    expect(accountStatusSchema.parse("deactivated")).toBe("deactivated");
  });

  it("rejects invalid statuses", () => {
    const result = accountStatusSchema.safeParse("banned");
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// BASE PROFILE SCHEMA
// ============================================================================

describe("baseProfileSchema", () => {
  it("accepts valid base profile", () => {
    const valid = {
      displayName: "John Doe",
      bio: "Experienced household professional",
      phoneNumber: "+573001234567",
      avatarUrl: "https://example.com/avatar.jpg",
    };

    const result = baseProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires display name with minimum 2 characters", () => {
    const short = { displayName: "J" };
    const result = baseProfileSchema.safeParse(short);
    expect(result.success).toBe(false);
  });

  it("enforces display name maximum 100 characters", () => {
    const long = { displayName: "A".repeat(101) };
    const result = baseProfileSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it("enforces bio maximum 1000 characters", () => {
    const validBio = {
      displayName: "John Doe",
      bio: "A".repeat(1000),
    };
    expect(baseProfileSchema.safeParse(validBio).success).toBe(true);

    const invalidBio = {
      displayName: "John Doe",
      bio: "A".repeat(1001),
    };
    expect(baseProfileSchema.safeParse(invalidBio).success).toBe(false);
  });

  it("accepts profile without optional fields", () => {
    const minimal = { displayName: "John Doe" };
    const result = baseProfileSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("validates avatar URL format", () => {
    const invalidUrl = {
      displayName: "John Doe",
      avatarUrl: "not-a-url",
    };
    const result = baseProfileSchema.safeParse(invalidUrl);
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
    hourlyRate: 50000,
    yearsExperience: 5,
    serviceRadius: 20,
    languages: ["Spanish", "English"],
    specialties: ["Cleaning", "Cooking"],
  };

  it("accepts valid professional profile", () => {
    const result = professionalProfileSchema.safeParse(validProfessional);
    expect(result.success).toBe(true);
  });

  it("requires role to be 'professional'", () => {
    const invalid = { ...validProfessional, role: "customer" };
    const result = professionalProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires positive hourly rate", () => {
    const zero = { ...validProfessional, hourlyRate: 0 };
    expect(professionalProfileSchema.safeParse(zero).success).toBe(false);

    const negative = { ...validProfessional, hourlyRate: -1000 };
    expect(professionalProfileSchema.safeParse(negative).success).toBe(false);
  });

  it("requires integer hourly rate", () => {
    const decimal = { ...validProfessional, hourlyRate: 50000.5 };
    const result = professionalProfileSchema.safeParse(decimal);
    expect(result.success).toBe(false);
  });

  it("validates years of experience (0-50)", () => {
    const zero = { ...validProfessional, yearsExperience: 0 };
    expect(professionalProfileSchema.safeParse(zero).success).toBe(true);

    const fifty = { ...validProfessional, yearsExperience: 50 };
    expect(professionalProfileSchema.safeParse(fifty).success).toBe(true);

    const negative = { ...validProfessional, yearsExperience: -1 };
    expect(professionalProfileSchema.safeParse(negative).success).toBe(false);

    const tooHigh = { ...validProfessional, yearsExperience: 51 };
    expect(professionalProfileSchema.safeParse(tooHigh).success).toBe(false);
  });

  it("validates service radius (max 100km)", () => {
    const valid = { ...validProfessional, serviceRadius: 100 };
    expect(professionalProfileSchema.safeParse(valid).success).toBe(true);

    const tooLarge = { ...validProfessional, serviceRadius: 101 };
    expect(professionalProfileSchema.safeParse(tooLarge).success).toBe(false);

    const negative = { ...validProfessional, serviceRadius: -5 };
    expect(professionalProfileSchema.safeParse(negative).success).toBe(false);
  });

  it("requires at least one language (max 10)", () => {
    const noLanguages = { ...validProfessional, languages: [] };
    expect(professionalProfileSchema.safeParse(noLanguages).success).toBe(false);

    const tenLanguages = {
      ...validProfessional,
      languages: Array(10).fill("Spanish"),
    };
    expect(professionalProfileSchema.safeParse(tenLanguages).success).toBe(true);

    const tooMany = {
      ...validProfessional,
      languages: Array(11).fill("Spanish"),
    };
    expect(professionalProfileSchema.safeParse(tooMany).success).toBe(false);
  });

  it("requires at least one specialty (max 10)", () => {
    const noSpecialties = { ...validProfessional, specialties: [] };
    expect(professionalProfileSchema.safeParse(noSpecialties).success).toBe(false);

    const tenSpecialties = {
      ...validProfessional,
      specialties: Array(10).fill("Cleaning"),
    };
    expect(professionalProfileSchema.safeParse(tenSpecialties).success).toBe(true);

    const tooMany = {
      ...validProfessional,
      specialties: Array(11).fill("Cleaning"),
    };
    expect(professionalProfileSchema.safeParse(tooMany).success).toBe(false);
  });

  it("validates certifications (max 20)", () => {
    const valid = {
      ...validProfessional,
      certifications: Array(20).fill("CPR Certified"),
    };
    expect(professionalProfileSchema.safeParse(valid).success).toBe(true);

    const tooMany = {
      ...validProfessional,
      certifications: Array(21).fill("CPR Certified"),
    };
    expect(professionalProfileSchema.safeParse(tooMany).success).toBe(false);
  });

  it("accepts availability schedule", () => {
    const withSchedule = {
      ...validProfessional,
      availability: {
        monday: { start: "09:00", end: "17:00" },
        friday: { start: "10:00", end: "14:00" },
      },
    };
    const result = professionalProfileSchema.safeParse(withSchedule);
    expect(result.success).toBe(true);
  });

  it("defaults acceptingNewClients to true", () => {
    const result = professionalProfileSchema.parse(validProfessional);
    expect(result.acceptingNewClients).toBe(true);
  });
});

// ============================================================================
// CUSTOMER PROFILE SCHEMA
// ============================================================================

describe("customerProfileSchema", () => {
  const validCustomer = {
    role: "customer" as const,
    displayName: "Juan Perez",
  };

  it("accepts valid customer profile", () => {
    const result = customerProfileSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it("requires role to be 'customer'", () => {
    const invalid = { ...validCustomer, role: "professional" };
    const result = customerProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("defaults preferred language to 'es'", () => {
    const result = customerProfileSchema.parse(validCustomer);
    expect(result.preferredLanguage).toBe("es");
  });

  it("validates preferred language length (2 chars)", () => {
    const valid = { ...validCustomer, preferredLanguage: "en" };
    expect(customerProfileSchema.safeParse(valid).success).toBe(true);

    const short = { ...validCustomer, preferredLanguage: "e" };
    expect(customerProfileSchema.safeParse(short).success).toBe(false);

    const long = { ...validCustomer, preferredLanguage: "eng" };
    expect(customerProfileSchema.safeParse(long).success).toBe(false);
  });

  it("accepts notification preferences", () => {
    const withPrefs = {
      ...validCustomer,
      notificationPreferences: {
        email: true,
        push: false,
        sms: true,
      },
    };
    const result = customerProfileSchema.safeParse(withPrefs);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// UPDATE PROFILE SCHEMAS
// ============================================================================

describe("updateProfessionalProfileSchema", () => {
  it("accepts partial updates", () => {
    const partialUpdate = {
      hourlyRate: 60000,
      acceptingNewClients: false,
    };
    const result = updateProfessionalProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it("accepts empty update object", () => {
    const result = updateProfessionalProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates optional fields same as create", () => {
    const invalidRate = { hourlyRate: -1000 };
    expect(updateProfessionalProfileSchema.safeParse(invalidRate).success).toBe(false);

    const invalidExperience = { yearsExperience: 51 };
    expect(updateProfessionalProfileSchema.safeParse(invalidExperience).success).toBe(false);
  });
});

describe("updateCustomerProfileSchema", () => {
  it("accepts partial updates", () => {
    const partialUpdate = {
      displayName: "New Name",
      preferredLanguage: "en",
    };
    const result = updateCustomerProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it("accepts partial notification preferences", () => {
    const update = {
      notificationPreferences: {
        email: false,
      },
    };
    const result = updateCustomerProfileSchema.safeParse(update);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

describe("signUpSchema", () => {
  const validSignUp = {
    email: "juan@example.com",
    password: "SecurePass123",
    displayName: "Juan Perez",
    role: "customer" as const,
  };

  it("accepts valid signup", () => {
    const result = signUpSchema.safeParse(validSignUp);
    expect(result.success).toBe(true);
  });

  it("requires valid email", () => {
    const invalid = { ...validSignUp, email: "not-an-email" };
    const result = signUpSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires password minimum 8 characters", () => {
    const short = { ...validSignUp, password: "Abc123" };
    const result = signUpSchema.safeParse(short);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("at least 8 characters");
    }
  });

  it("requires password with uppercase letter", () => {
    const noUpper = { ...validSignUp, password: "password123" };
    const result = signUpSchema.safeParse(noUpper);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("uppercase letter");
    }
  });

  it("requires password with lowercase letter", () => {
    const noLower = { ...validSignUp, password: "PASSWORD123" };
    const result = signUpSchema.safeParse(noLower);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("lowercase letter");
    }
  });

  it("requires password with number", () => {
    const noNumber = { ...validSignUp, password: "PasswordABC" };
    const result = signUpSchema.safeParse(noNumber);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("number");
    }
  });

  it("enforces password maximum 100 characters", () => {
    const long = { ...validSignUp, password: "A1a" + "a".repeat(98) };
    const result = signUpSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it("requires display name minimum 2 characters", () => {
    const short = { ...validSignUp, displayName: "J" };
    const result = signUpSchema.safeParse(short);
    expect(result.success).toBe(false);
  });

  it("requires valid user role", () => {
    const invalid = { ...validSignUp, role: "superuser" };
    const result = signUpSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts valid signin", () => {
    const valid = {
      email: "juan@example.com",
      password: "any-password",
    };
    const result = signInSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires email", () => {
    const missing = { password: "password" };
    const result = signInSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("requires password", () => {
    const missing = { email: "juan@example.com" };
    const result = signInSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("validates email format", () => {
    const invalid = { email: "not-email", password: "password" };
    const result = signInSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordRequestSchema", () => {
  it("accepts valid email", () => {
    const valid = { email: "juan@example.com" };
    const result = resetPasswordRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires valid email format", () => {
    const invalid = { email: "not-email" };
    const result = resetPasswordRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid reset", () => {
    const valid = {
      token: "reset-token-123",
      newPassword: "NewSecure123",
    };
    const result = resetPasswordSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires token", () => {
    const missing = { newPassword: "NewSecure123" };
    const result = resetPasswordSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("validates new password strength (same as signup)", () => {
    const weak = { token: "token", newPassword: "weak" };
    const result = resetPasswordSchema.safeParse(weak);
    expect(result.success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("accepts valid password update", () => {
    const valid = {
      currentPassword: "OldPass123",
      newPassword: "NewSecure456",
    };
    const result = updatePasswordSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires current password", () => {
    const missing = { newPassword: "NewSecure456" };
    const result = updatePasswordSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("validates new password strength", () => {
    const weak = {
      currentPassword: "OldPass123",
      newPassword: "weak",
    };
    const result = updatePasswordSchema.safeParse(weak);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ACCOUNT MANAGEMENT SCHEMAS
// ============================================================================

describe("deleteAccountSchema", () => {
  it("accepts valid deletion request", () => {
    const valid = {
      confirmPassword: "password",
      reason: "No longer need the service",
      feedback: "Great platform, but moving abroad",
    };
    const result = deleteAccountSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires password confirmation", () => {
    const missing = { reason: "No longer need" };
    const result = deleteAccountSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("requires reason minimum 10 characters", () => {
    const short = {
      confirmPassword: "password",
      reason: "Too short",
    };
    const result = deleteAccountSchema.safeParse(short);
    expect(result.success).toBe(false);
  });

  it("enforces reason maximum 500 characters", () => {
    const long = {
      confirmPassword: "password",
      reason: "A".repeat(501),
    };
    const result = deleteAccountSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it("enforces feedback maximum 2000 characters", () => {
    const valid = {
      confirmPassword: "password",
      feedback: "A".repeat(2000),
    };
    expect(deleteAccountSchema.safeParse(valid).success).toBe(true);

    const tooLong = {
      confirmPassword: "password",
      feedback: "A".repeat(2001),
    };
    expect(deleteAccountSchema.safeParse(tooLong).success).toBe(false);
  });

  it("allows optional reason and feedback", () => {
    const minimal = { confirmPassword: "password" };
    const result = deleteAccountSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});

describe("exportDataSchema", () => {
  it("defaults all includes to true", () => {
    const result = exportDataSchema.parse({});
    expect(result.includeBookings).toBe(true);
    expect(result.includeMessages).toBe(true);
    expect(result.includeProfile).toBe(true);
    expect(result.includePayments).toBe(true);
  });

  it("defaults format to json", () => {
    const result = exportDataSchema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts csv format", () => {
    const valid = { format: "csv" as const };
    const result = exportDataSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid formats", () => {
    const invalid = { format: "xml" };
    const result = exportDataSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("allows selective data export", () => {
    const selective = {
      includeBookings: true,
      includeMessages: false,
      includeProfile: true,
      includePayments: false,
      format: "json" as const,
    };
    const result = exportDataSchema.safeParse(selective);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// ADMIN OPERATIONS SCHEMAS
// ============================================================================

describe("moderateUserSchema", () => {
  const validModeration = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    action: "suspend" as const,
    reason: "Violated terms of service by spamming",
  };

  it("accepts valid moderation action", () => {
    const result = moderateUserSchema.safeParse(validModeration);
    expect(result.success).toBe(true);
  });

  it("accepts all moderation actions", () => {
    expect(
      moderateUserSchema.safeParse({ ...validModeration, action: "suspend" }).success
    ).toBe(true);
    expect(
      moderateUserSchema.safeParse({ ...validModeration, action: "activate" }).success
    ).toBe(true);
    expect(
      moderateUserSchema.safeParse({ ...validModeration, action: "deactivate" }).success
    ).toBe(true);
    expect(moderateUserSchema.safeParse({ ...validModeration, action: "warn" }).success).toBe(
      true
    );
  });

  it("rejects invalid actions", () => {
    const invalid = { ...validModeration, action: "ban" };
    const result = moderateUserSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires valid UUID for userId", () => {
    const invalid = { ...validModeration, userId: "not-a-uuid" };
    const result = moderateUserSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires reason minimum 10 characters", () => {
    const short = { ...validModeration, reason: "Too short" };
    const result = moderateUserSchema.safeParse(short);
    expect(result.success).toBe(false);
  });

  it("enforces reason maximum 1000 characters", () => {
    const valid = { ...validModeration, reason: "A".repeat(1000) };
    expect(moderateUserSchema.safeParse(valid).success).toBe(true);

    const tooLong = { ...validModeration, reason: "A".repeat(1001) };
    expect(moderateUserSchema.safeParse(tooLong).success).toBe(false);
  });

  it("accepts optional duration for temporary actions", () => {
    const withDuration = { ...validModeration, duration: 7 };
    const result = moderateUserSchema.safeParse(withDuration);
    expect(result.success).toBe(true);
  });

  it("requires positive duration", () => {
    const zero = { ...validModeration, duration: 0 };
    expect(moderateUserSchema.safeParse(zero).success).toBe(false);

    const negative = { ...validModeration, duration: -5 };
    expect(moderateUserSchema.safeParse(negative).success).toBe(false);
  });
});

describe("updateUserRoleSchema", () => {
  const validRoleUpdate = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    newRole: "professional" as const,
    reason: "User completed professional verification",
  };

  it("accepts valid role update", () => {
    const result = updateUserRoleSchema.safeParse(validRoleUpdate);
    expect(result.success).toBe(true);
  });

  it("requires valid UUID", () => {
    const invalid = { ...validRoleUpdate, userId: "not-uuid" };
    const result = updateUserRoleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires valid role", () => {
    const invalid = { ...validRoleUpdate, newRole: "superadmin" };
    const result = updateUserRoleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires reason minimum 10 characters", () => {
    const short = { ...validRoleUpdate, reason: "Approved" };
    const result = updateUserRoleSchema.safeParse(short);
    expect(result.success).toBe(false);
  });

  it("enforces reason maximum 500 characters", () => {
    const valid = { ...validRoleUpdate, reason: "A".repeat(500) };
    expect(updateUserRoleSchema.safeParse(valid).success).toBe(true);

    const tooLong = { ...validRoleUpdate, reason: "A".repeat(501) };
    expect(updateUserRoleSchema.safeParse(tooLong).success).toBe(false);
  });
});

// ============================================================================
// VERIFICATION SCHEMAS
// ============================================================================

describe("verifyEmailSchema", () => {
  it("accepts valid token", () => {
    const valid = { token: "verification-token-123" };
    const result = verifyEmailSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires token", () => {
    const missing = {};
    const result = verifyEmailSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("rejects empty token", () => {
    const empty = { token: "" };
    const result = verifyEmailSchema.safeParse(empty);
    expect(result.success).toBe(false);
  });
});

describe("verifyPhoneSchema", () => {
  it("accepts valid phone verification", () => {
    const valid = {
      phoneNumber: "+573001234567",
      verificationCode: "123456",
    };
    const result = verifyPhoneSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires exactly 6 digits for verification code", () => {
    const short = {
      phoneNumber: "+573001234567",
      verificationCode: "12345",
    };
    expect(verifyPhoneSchema.safeParse(short).success).toBe(false);

    const long = {
      phoneNumber: "+573001234567",
      verificationCode: "1234567",
    };
    expect(verifyPhoneSchema.safeParse(long).success).toBe(false);
  });

  it("requires verification code to be digits only", () => {
    const withLetters = {
      phoneNumber: "+573001234567",
      verificationCode: "12A456",
    };
    const result = verifyPhoneSchema.safeParse(withLetters);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("6 digits");
    }
  });

  it("requires valid phone number format", () => {
    const invalid = {
      phoneNumber: "not-a-phone",
      verificationCode: "123456",
    };
    const result = verifyPhoneSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
