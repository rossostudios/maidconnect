"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SAMPLE_FAQS = [
  {
    id: "1",
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
    category: "billing",
  },
  {
    id: "2",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All payments are processed securely.",
    category: "billing",
  },
  {
    id: "3",
    question: "Is there a free trial?",
    answer:
      "Yes, we offer a 14-day free trial on all paid plans. No credit card required to start. You can cancel anytime during the trial period.",
    category: "general",
  },
  {
    id: "4",
    question: "How secure is my data?",
    answer:
      "We use bank-level 256-bit encryption and are SOC 2 Type II compliant. Your data is stored in secure data centers with regular backups. We never share your data with third parties.",
    category: "security",
  },
  {
    id: "5",
    question: "What happens if I exceed my plan limits?",
    answer:
      "We'll notify you when you're approaching your limits. You can either upgrade to a higher plan or wait until the next billing cycle. We won't charge overage fees without your approval.",
    category: "billing",
  },
  {
    id: "6",
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us within 30 days for a full refund, no questions asked.",
    category: "billing",
  },
];

export function PricingFaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {SAMPLE_FAQS.map((faq) => (
        <Card
          className={cn(
            "overflow-hidden border-2 transition-all",
            openFaqId === faq.id ? "border-stone-900" : "border-stone-200 hover:border-stone-300"
          )}
          key={faq.id}
        >
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            onClick={() => toggleFaq(faq.id)}
            type="button"
          >
            <span className="font-semibold text-lg text-stone-900">{faq.question}</span>
            <HugeiconsIcon
              className={cn(
                "flex-shrink-0 text-stone-600 transition-transform",
                openFaqId === faq.id ? "rotate-180" : ""
              )}
              icon={ArrowDown01Icon}
              size={24}
            />
          </button>

          {openFaqId === faq.id && (
            <CardContent className="px-6 pb-5">
              <p className="text-stone-700 leading-relaxed">{faq.answer}</p>
            </CardContent>
          )}
        </Card>
      ))}

      <div className="pt-8 text-center">
        <p className="mb-4 text-stone-600">Still have questions?</p>
        <a
          className="inline-block rounded-xl border-2 border-stone-300 px-6 py-3 font-medium text-stone-900 transition-all hover:border-stone-900"
          href="/contact"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
