import { z } from "zod";
import { emailSchema, phoneSchema, uuidSchema } from "./api";

/**
 * Authentication & Profile Validation Schemas
 *
 * Validates user profiles, authentication, and account management operations.
 */

// ============================================
// User Role Enums
// ============================================

export const userRoleSchema = z.enum(["customer", "professional", "admin"]);

type UserRole = z.infer<typeof userRoleSchema>;

export const accountStatusSchema = z.enum(["active", "suspended", "deactivated"]);

type AccountStatus = z.infer<typeof accountStatusSchema>;

// ============================================
// Base Profile Schema
// ============================================

export const baseProfileSchema = z.object({
  displayName: z.string().min(2).max(100),
  bio: z.string().max(1000).optional(),
  phoneNumber: phoneSchema.optional(),
  avatarUrl: z.string().url().optional(),
});

// ============================================
// Professional Profile Schema
// ============================================

export const professionalProfileSchema = baseProfileSchema.extend({
  role: z.literal("professional"),
  hourlyRate: z.number().positive().int(),
  yearsExperience: z.number().int().min(0).max(50),
  serviceRadius: z.number().positive().max(100), // km
  languages: z.array(z.string().min(2).max(50)).min(1).max(10),
  certifications: z.array(z.string().max(200)).max(20).optional(),
  specialties: z.array(z.string().max(100)).min(1).max(10),
  availability: z
    .object({
      monday: z.object({ start: z.string(), end: z.string() }).optional(),
      tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
      wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
      thursday: z.object({ start: z.string(), end: z.string() }).optional(),
      friday: z.object({ start: z.string(), end: z.string() }).optional(),
      saturday: z.object({ start: z.string(), end: z.string() }).optional(),
      sunday: z.object({ start: z.string(), end: z.string() }).optional(),
    })
    .optional(),
  acceptingNewClients: z.boolean().default(true),
});

type ProfessionalProfile = z.infer<typeof professionalProfileSchema>;

// ============================================
// Customer Profile Schema
// ============================================

export const customerProfileSchema = baseProfileSchema.extend({
  role: z.literal("customer"),
  preferredLanguage: z.string().length(2).default("es"),
  notificationPreferences: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    })
    .optional(),
});

type CustomerProfile = z.infer<typeof customerProfileSchema>;

// ============================================
// Update Profile Schemas
// ============================================

export const updateBaseProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  phoneNumber: phoneSchema.optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateProfessionalProfileSchema = updateBaseProfileSchema.extend({
  hourlyRate: z.number().positive().int().optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  serviceRadius: z.number().positive().max(100).optional(),
  languages: z.array(z.string().min(2).max(50)).min(1).max(10).optional(),
  certifications: z.array(z.string().max(200)).max(20).optional(),
  specialties: z.array(z.string().max(100)).min(1).max(10).optional(),
  acceptingNewClients: z.boolean().optional(),
});

type UpdateProfessionalProfileInput = z.infer<typeof updateProfessionalProfileSchema>;

export const updateCustomerProfileSchema = updateBaseProfileSchema.extend({
  preferredLanguage: z.string().length(2).optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
});

type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

// ============================================
// Authentication Schemas
// ============================================

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z.string().min(2).max(100),
  role: userRoleSchema,
});

type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

type SignInInput = z.infer<typeof signInSchema>;

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

// ============================================
// Account Management Schemas
// ============================================

export const deleteAccountSchema = z.object({
  confirmPassword: z.string().min(1, "Password confirmation required"),
  reason: z.string().min(10).max(500).optional(),
  feedback: z.string().max(2000).optional(),
});

type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const exportDataSchema = z.object({
  includeBookings: z.boolean().default(true),
  includeMessages: z.boolean().default(true),
  includeProfile: z.boolean().default(true),
  includePayments: z.boolean().default(true),
  format: z.enum(["json", "csv"]).default("json"),
});

type ExportDataInput = z.infer<typeof exportDataSchema>;

// ============================================
// Admin Operations Schemas
// ============================================

export const moderateUserSchema = z.object({
  userId: uuidSchema,
  action: z.enum(["suspend", "activate", "deactivate", "warn"]),
  reason: z.string().min(10).max(1000),
  duration: z.number().int().positive().optional(), // Duration in days for temporary actions
});

type ModerateUserInput = z.infer<typeof moderateUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: uuidSchema,
  newRole: userRoleSchema,
  reason: z.string().min(10).max(500),
});

type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// ============================================
// Verification Schemas
// ============================================

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const verifyPhoneSchema = z.object({
  phoneNumber: phoneSchema,
  verificationCode: z.string().length(6).regex(/^\d+$/, "Verification code must be 6 digits"),
});

type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
