/**
 * User Details - Finances Tab
 *
 * Displays earnings/payouts (professionals) and spending/payment methods (customers)
 */

"use client";

import { memo } from "react";
import { formatCOP } from "@/lib/utils/format";
import {
  extractCustomerFinances,
  extractProfessionalFinances,
  getStripeConnectionText,
  getStripeStatusBadgeClass,
  getStripeVerificationText,
} from "./helpers";
import { DataField, MetricCard, SectionCard } from "./shared-components";
import { FinancesSkeleton } from "./skeletons";
import type { BaseUser } from "./types";

type FinancesTabProps = {
  user: BaseUser;
  data?: unknown;
};

type PayoutCardProps = {
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
};

type PaymentMethodCardProps = {
  type: string;
  brand: string;
  last4: string;
  expiry: string;
  is_default: boolean;
};

type TransactionCardProps = {
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
};

/**
 * PayoutCard - Displays payout information
 */
function PayoutCard({ amount, status, date, method }: PayoutCardProps) {
  const statusConfig = {
    completed: { color: "bg-green-50 border-green-600 text-green-900", text: "Completed" },
    pending: { color: "bg-rausch-50 border-rausch-600 text-rausch-900", text: "Pending" },
    failed: { color: "bg-red-50 border-red-600 text-red-900", text: "Failed" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 tabular-nums">
          {formatCOP(amount)}
        </p>
        <p className="text-neutral-700 text-sm">
          {date} · {method}
        </p>
      </div>
      <span
        className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
      >
        {config.text}
      </span>
    </div>
  );
}

/**
 * PaymentMethodCard - Displays payment method information
 */
function PaymentMethodCard({ brand, last4, expiry, is_default }: PaymentMethodCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {brand} •••• {last4}
          </span>
        </div>
        {is_default && (
          <span className="inline-block rounded-full border border-rausch-600 bg-rausch-50 px-2 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-rausch-900 text-xs tracking-wider">
            Default
          </span>
        )}
      </div>
      <p className="text-neutral-600 text-sm">Expires {expiry}</p>
    </div>
  );
}

/**
 * TransactionCard - Memoized to prevent re-renders in transaction lists
 */
const TransactionCard = memo(function TransactionCard({
  type,
  description,
  amount,
  date,
}: TransactionCardProps) {
  const isNegative = amount < 0;

  // Helper function to get type label
  const getTypeLabel = (t: string): string => {
    if (t === "booking") {
      return "Booking";
    }
    if (t === "fee") {
      return "Fee";
    }
    return "Tip";
  };

  // Helper function to get type color classes
  const getTypeColor = (t: string): string => {
    if (t === "booking") {
      return "border-babu-600 bg-babu-50 text-babu-900";
    }
    if (t === "fee") {
      return "border-red-600 bg-red-50 text-red-900";
    }
    return "border-green-600 bg-green-50 text-green-900";
  };

  const typeLabel = getTypeLabel(type);
  const typeColor = getTypeColor(type);

  return (
    <div className="flex items-center justify-between border-neutral-100 border-b pb-3 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`inline-block rounded-full border px-2 py-0.5 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${typeColor}`}
          >
            {typeLabel}
          </span>
          <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900 text-sm">
            {description}
          </span>
        </div>
        <p className="text-neutral-600 text-xs">{date}</p>
      </div>
      <span
        className={`font-[family-name:var(--font-geist-sans)] font-medium tabular-nums ${
          isNegative ? "text-red-900" : "text-green-900"
        }`}
      >
        {isNegative ? "-" : "+"}
        {formatCOP(Math.abs(amount))}
      </span>
    </div>
  );
});

/**
 * FinancesTab - Lia Design System
 * Professional earnings/payouts and customer spending/payment methods
 * Memoized to prevent re-renders when other tabs change
 */
export const FinancesTab = memo(function FinancesTab({ user, data }: FinancesTabProps) {
  if (!data) {
    return <FinancesSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data using helper functions (from /api/admin/users/[id]/finances)
  const apiData = data as any;
  const professionalFinances = extractProfessionalFinances(apiData, isProfessional);
  const customerFinances = extractCustomerFinances(apiData, isCustomer);

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalFinances && (
        <>
          {/* Earnings Overview */}
          <SectionCard title="Earnings Overview">
            <div className="grid gap-6 md:grid-cols-3">
              <MetricCard
                label="Total Earnings"
                value={formatCOP(professionalFinances.earnings.total)}
              />
              <MetricCard
                label="Pending Payouts"
                value={formatCOP(professionalFinances.earnings.pending)}
              />
              <MetricCard
                label="Completed Payouts"
                value={formatCOP(professionalFinances.earnings.completed)}
              />
            </div>
          </SectionCard>

          {/* Stripe Account Status */}
          <SectionCard title="Stripe Account Status">
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
              <DataField
                label="Connection Status"
                value={
                  <span
                    className={getStripeStatusBadgeClass(
                      professionalFinances.stripe.connected,
                      "connection"
                    )}
                  >
                    {getStripeConnectionText(professionalFinances.stripe.connected)}
                  </span>
                }
              />
              <DataField
                label="Verification Status"
                value={
                  <span
                    className={getStripeStatusBadgeClass(
                      professionalFinances.stripe.verified,
                      "verification"
                    )}
                  >
                    {getStripeVerificationText(professionalFinances.stripe.verified)}
                  </span>
                }
              />
              <DataField
                label="Account ID"
                value={
                  <span className="font-mono text-sm">
                    {professionalFinances.stripe.account_id || "—"}
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* Payout History */}
          <SectionCard title="Payout History">
            <div className="space-y-4">
              {professionalFinances.payouts.map((payout: any) => (
                <PayoutCard
                  amount={payout.amount}
                  date={new Date(payout.payout_date).toLocaleDateString()}
                  key={payout.id}
                  method="Bank Transfer"
                  status={payout.status as "completed" | "pending" | "failed"}
                />
              ))}
              {professionalFinances.payouts.length === 0 && (
                <p className="text-neutral-600 text-sm">No payout history</p>
              )}
            </div>
          </SectionCard>

          {/* Transaction History */}
          <SectionCard title="Recent Transactions">
            <div className="space-y-3">
              {professionalFinances.transactions.map((transaction: any) => (
                <TransactionCard
                  amount={transaction.amount}
                  date={transaction.date}
                  description={transaction.description}
                  key={transaction.id}
                  status={transaction.status}
                  type={transaction.type}
                />
              ))}
              {professionalFinances.transactions.length === 0 && (
                <p className="text-neutral-600 text-sm">No recent transactions</p>
              )}
            </div>
          </SectionCard>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerFinances && (
        <>
          {/* Spending Overview */}
          <SectionCard title="Spending Overview">
            <div className="grid gap-6 md:grid-cols-3">
              <MetricCard label="Total Spent" value={formatCOP(customerFinances.spending.total)} />
              <MetricCard
                label="Avg Per Booking"
                value={formatCOP(customerFinances.spending.averagePerBooking)}
              />
              <MetricCard
                label="This Month"
                value={formatCOP(customerFinances.spending.thisMonth)}
              />
            </div>
          </SectionCard>

          {/* Payment Methods */}
          <SectionCard title="Payment Methods">
            <div className="space-y-4">
              {customerFinances.paymentMethods.map((method: any) => (
                <PaymentMethodCard
                  brand={method.brand}
                  expiry={method.expiry}
                  is_default={method.is_default}
                  key={method.id}
                  last4={method.last4}
                  type={method.type}
                />
              ))}
            </div>
            {customerFinances.paymentMethods.length === 0 && (
              <p className="text-neutral-600 text-sm">No payment methods on file</p>
            )}
          </SectionCard>

          {/* Spending by Category */}
          <SectionCard title="Spending by Category">
            <div className="space-y-3">
              {customerFinances.spendingByCategory.map((category: any, idx: number) => (
                <div
                  className="flex items-center justify-between border-neutral-100 border-b pb-3 last:border-0 last:pb-0"
                  key={idx}
                >
                  <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900">
                    {category.category}
                  </span>
                  <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 tabular-nums">
                    {formatCOP(category.amount)}
                  </span>
                </div>
              ))}
              {customerFinances.spendingByCategory.length === 0 && (
                <p className="text-neutral-600 text-sm">No spending data</p>
              )}
            </div>
          </SectionCard>

          {/* Transaction History */}
          <SectionCard title="Recent Transactions">
            <div className="space-y-3">
              {customerFinances.transactions.map((transaction: any) => (
                <TransactionCard
                  amount={transaction.amount}
                  date={transaction.date}
                  description={transaction.description}
                  key={transaction.id}
                  status={transaction.status}
                  type={transaction.type}
                />
              ))}
              {customerFinances.transactions.length === 0 && (
                <p className="text-neutral-600 text-sm">No recent transactions</p>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
});
