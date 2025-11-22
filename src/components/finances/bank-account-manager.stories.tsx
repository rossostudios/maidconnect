import type { Meta, StoryObj } from "@storybook/react";
import { HttpResponse, http } from "msw";
import { BankAccountManager } from "./bank-account-manager";

const meta = {
  title: "Finances/BankAccountManager",
  component: BankAccountManager,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BankAccountManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Mock Data
// ========================================

const mockVerifiedAccount = {
  success: true,
  bankAccounts: [
    {
      id: "ba_1234567890",
      bankName: "Bancolombia",
      last4: "4242",
      currency: "COP",
      routingNumber: "0123456789",
      accountHolderName: "María García",
      accountHolderType: "individual",
      status: "verified",
      isDefault: true,
    },
  ],
  defaultAccount: "cop",
  hasVerifiedAccount: true,
  requiresOnboarding: false,
  payoutsEnabled: true,
};

const mockMultipleAccounts = {
  success: true,
  bankAccounts: [
    {
      id: "ba_1234567890",
      bankName: "Bancolombia",
      last4: "4242",
      currency: "COP",
      routingNumber: "0123456789",
      accountHolderName: "María García",
      accountHolderType: "individual",
      status: "verified",
      isDefault: true,
    },
    {
      id: "ba_9876543210",
      bankName: "Banco de Bogotá",
      last4: "8888",
      currency: "COP",
      routingNumber: "9876543210",
      accountHolderName: "María García",
      accountHolderType: "individual",
      status: "validated",
      isDefault: false,
    },
  ],
  defaultAccount: "cop",
  hasVerifiedAccount: true,
  requiresOnboarding: false,
  payoutsEnabled: true,
};

const mockNewAccount = {
  success: true,
  bankAccounts: [
    {
      id: "ba_new123456",
      bankName: "Davivienda",
      last4: "1234",
      currency: "COP",
      routingNumber: "1112223333",
      accountHolderName: "Juan Pérez",
      accountHolderType: "individual",
      status: "new",
      isDefault: true,
    },
  ],
  defaultAccount: "cop",
  hasVerifiedAccount: false,
  requiresOnboarding: false,
  payoutsEnabled: false,
};

const mockFailedVerification = {
  success: true,
  bankAccounts: [
    {
      id: "ba_failed123",
      bankName: "Banco Caja Social",
      last4: "9999",
      currency: "COP",
      routingNumber: "4445556666",
      accountHolderName: "Carlos Rodríguez",
      accountHolderType: "individual",
      status: "verification_failed",
      isDefault: true,
    },
  ],
  defaultAccount: "cop",
  hasVerifiedAccount: false,
  requiresOnboarding: false,
  payoutsEnabled: false,
};

const mockRequiresOnboarding = {
  success: true,
  bankAccounts: [],
  defaultAccount: null,
  hasVerifiedAccount: false,
  requiresOnboarding: true,
  payoutsEnabled: false,
};

const mockNoAccounts = {
  success: true,
  bankAccounts: [],
  defaultAccount: "cop",
  hasVerifiedAccount: false,
  requiresOnboarding: false,
  payoutsEnabled: false,
};

// ========================================
// Stories
// ========================================

/**
 * Default state with a single verified bank account ready to receive payouts
 */
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockVerifiedAccount)),
      ],
    },
  },
};

/**
 * Professional with multiple bank accounts connected
 */
export const MultipleAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockMultipleAccounts)),
      ],
    },
  },
};

/**
 * Newly added bank account that hasn't been verified yet
 */
export const NewAccount: Story = {
  parameters: {
    msw: {
      handlers: [http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockNewAccount))],
    },
  },
};

/**
 * Bank account that failed verification
 */
export const FailedVerification: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockFailedVerification)),
      ],
    },
  },
};

/**
 * Professional who needs to complete Stripe Connect onboarding
 */
export const RequiresOnboarding: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockRequiresOnboarding)),
      ],
    },
  },
};

/**
 * No bank accounts connected, but onboarding is complete
 */
export const NoAccounts: Story = {
  parameters: {
    msw: {
      handlers: [http.get("/api/pro/stripe/bank-account", () => HttpResponse.json(mockNoAccounts))],
    },
  },
};

/**
 * Loading state while fetching bank account data
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", async () => {
          await new Promise((resolve) => setTimeout(resolve, 10_000));
          return HttpResponse.json(mockVerifiedAccount);
        }),
      ],
    },
  },
};

/**
 * Error state when API call fails
 */
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () =>
          HttpResponse.json({ error: "Failed to fetch bank account details" }, { status: 500 })
        ),
      ],
    },
  },
};

/**
 * Verified account but payouts are disabled due to pending requirements
 */
export const PayoutsDisabled: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () =>
          HttpResponse.json({
            ...mockVerifiedAccount,
            payoutsEnabled: false,
          })
        ),
      ],
    },
  },
};

/**
 * Account with all possible statuses for comparison
 */
export const AllStatuses: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/pro/stripe/bank-account", () =>
          HttpResponse.json({
            success: true,
            bankAccounts: [
              {
                id: "ba_verified",
                bankName: "Bancolombia",
                last4: "0001",
                currency: "COP",
                routingNumber: "0123456789",
                accountHolderName: "María García",
                accountHolderType: "individual",
                status: "verified",
                isDefault: true,
              },
              {
                id: "ba_validated",
                bankName: "Banco de Bogotá",
                last4: "0002",
                currency: "COP",
                routingNumber: "0123456789",
                accountHolderName: "María García",
                accountHolderType: "individual",
                status: "validated",
                isDefault: false,
              },
              {
                id: "ba_new",
                bankName: "Davivienda",
                last4: "0003",
                currency: "COP",
                routingNumber: "0123456789",
                accountHolderName: "María García",
                accountHolderType: "individual",
                status: "new",
                isDefault: false,
              },
              {
                id: "ba_failed",
                bankName: "Banco Caja Social",
                last4: "0004",
                currency: "COP",
                routingNumber: "0123456789",
                accountHolderName: "María García",
                accountHolderType: "individual",
                status: "verification_failed",
                isDefault: false,
              },
              {
                id: "ba_errored",
                bankName: "Banco Popular",
                last4: "0005",
                currency: "COP",
                routingNumber: "0123456789",
                accountHolderName: "María García",
                accountHolderType: "individual",
                status: "errored",
                isDefault: false,
              },
            ],
            defaultAccount: "cop",
            hasVerifiedAccount: true,
            requiresOnboarding: false,
            payoutsEnabled: true,
          })
        ),
      ],
    },
  },
};
