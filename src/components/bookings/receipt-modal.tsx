"use client";

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Download04Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { ReceiptData } from "@/app/api/bookings/receipt/route";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { CustomerBooking } from "./customer-booking-list";

type Props = {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
};

export function ReceiptModal({ booking, isOpen, onClose }: Props) {
  const t = useTranslations("dashboard.customer.receipt");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipt = useCallback(async () => {
    if (!(isOpen && booking.id)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/receipt?bookingId=${booking.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load receipt");
      }

      setReceipt(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipt");
    } finally {
      setIsLoading(false);
    }
  }, [booking.id, isOpen]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  const formatCurrency = (cents: number, currency: string) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) {
      return;
    }

    // Generate a simple text receipt for download
    const receiptText = `
CASAORA RECEIPT
================
Receipt #: ${receipt.receipt_number}
Date: ${formatDate(receipt.date_issued)}

SERVICE DETAILS
---------------
Service: ${receipt.service.name}
Date: ${formatDate(receipt.service_date)}
Time: ${formatTime(receipt.service_date)}
Duration: ${receipt.service.duration_minutes} minutes
${receipt.service.address ? `Location: ${receipt.service.address}` : ""}

PROFESSIONAL
------------
${receipt.professional.name}

PAYMENT DETAILS
---------------
Service Total: ${formatCurrency(receipt.payment.subtotal, receipt.payment.currency)}
${receipt.payment.tip_amount > 0 ? `Tip: ${formatCurrency(receipt.payment.tip_amount, receipt.payment.currency)}` : ""}
--------------
Total Paid: ${formatCurrency(receipt.payment.total, receipt.payment.currency)}

Payment Method: ${receipt.payment.payment_method === "card" ? "Credit Card" : receipt.payment.payment_method}
Payment Date: ${formatDate(receipt.payment.payment_date)}

CUSTOMER
--------
${receipt.customer.name}
${receipt.customer.email}

================
Thank you for choosing Casaora!
support@casaora.com
`.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casaora-receipt-${receipt.receipt_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/80"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-neutral-200 border-b p-6 print:hidden">
          <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("title")}
          </h2>
          <button
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rausch-500 border-t-transparent" />
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

          {receipt && !isLoading && (
            <div className="space-y-6" id="receipt-content">
              {/* Receipt Header */}
              <div className="text-center">
                <h3 className={cn("font-semibold text-2xl text-neutral-900", geistSans.className)}>
                  CASAORA
                </h3>
                <p className="mt-1 text-neutral-600 text-sm">Service Receipt</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
                  <span className="font-medium text-sm">Payment Completed</span>
                </div>
              </div>

              {/* Receipt Number & Date */}
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t("receiptNumber")}</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {receipt.receipt_number}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-neutral-600">{t("dateIssued")}</span>
                  <span className="text-neutral-900">{formatDate(receipt.date_issued)}</span>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className={cn("mb-3 font-semibold text-neutral-900", geistSans.className)}>
                  {t("serviceDetails")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t("service")}</span>
                    <span className="font-medium text-neutral-900">{receipt.service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t("date")}</span>
                    <span className="text-neutral-900">{formatDate(receipt.service_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t("time")}</span>
                    <span className="text-neutral-900">{formatTime(receipt.service_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t("duration")}</span>
                    <span className="text-neutral-900">{receipt.service.duration_minutes} min</span>
                  </div>
                  {receipt.service.address && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t("location")}</span>
                      <span className="max-w-[200px] text-right text-neutral-900">
                        {receipt.service.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional */}
              <div>
                <h4 className={cn("mb-3 font-semibold text-neutral-900", geistSans.className)}>
                  {t("professional")}
                </h4>
                <p className="text-neutral-900 text-sm">{receipt.professional.name}</p>
              </div>

              {/* Payment Summary */}
              <div>
                <h4 className={cn("mb-3 font-semibold text-neutral-900", geistSans.className)}>
                  {t("paymentSummary")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t("serviceTotal")}</span>
                    <span className="text-neutral-900">
                      {formatCurrency(receipt.payment.subtotal, receipt.payment.currency)}
                    </span>
                  </div>
                  {receipt.payment.tip_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t("tip")}</span>
                      <span className="text-neutral-900">
                        {formatCurrency(receipt.payment.tip_amount, receipt.payment.currency)}
                      </span>
                    </div>
                  )}
                  <div className="border-neutral-200 border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-neutral-900">{t("totalPaid")}</span>
                      <span className="text-neutral-900">
                        {formatCurrency(receipt.payment.total, receipt.payment.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t("paymentMethod")}</span>
                  <span className="text-neutral-900">
                    {receipt.payment.payment_method === "card"
                      ? "Credit Card"
                      : receipt.payment.payment_method}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-neutral-600">{t("paymentDate")}</span>
                  <span className="text-neutral-900">
                    {formatDate(receipt.payment.payment_date)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-neutral-200 border-t pt-4 text-center text-neutral-500 text-xs">
                <p>{t("thankYou")}</p>
                <p className="mt-1">{receipt.company.support_email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {receipt && !isLoading && (
          <div className="flex gap-3 border-neutral-200 border-t p-6 print:hidden">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:text-rausch-600"
              onClick={handlePrint}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={PrinterIcon} />
              {t("print")}
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rausch-500 px-5 py-2.5 font-semibold text-sm text-white shadow-[0_4px_12px_rgba(217,119,87,0.22)] transition hover:bg-rausch-600"
              onClick={handleDownload}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Download04Icon} />
              {t("download")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
