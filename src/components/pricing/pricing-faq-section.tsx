/**
 * Pricing FAQ Section Component
 *
 * Displays frequently asked questions about pricing
 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Placeholder data - will be replaced with API call
const SAMPLE_FAQS = [
  {
    id: "1",
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
    category: "billing",
  },
  {
    id: "2",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All payments are processed securely.",
    category: "billing",
  },
  {
    id: "3",
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on all paid plans. No credit card required to start. You can cancel anytime during the trial period.",
    category: "general",
  },
  {
    id: "4",
    question: "How secure is my data?",
    answer: "We use bank-level 256-bit encryption and are SOC 2 Type II compliant. Your data is stored in secure data centers with regular backups. We never share your data with third parties.",
    category: "security",
  },
  {
    id: "5",
    question: "What happens if I exceed my plan limits?",
    answer: "We'll notify you when you're approaching your limits. You can either upgrade to a higher plan or wait until the next billing cycle. We won't charge overage fees without your approval.",
    category: "billing",
  },
  {
    id: "6",
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us within 30 days for a full refund, no questions asked.",
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
        <div
          key={faq.id}
          className="bg-white border-2 border-[#ebe5d8] rounded-[20px] overflow-hidden transition-all hover:border-[#ff5d46]"
        >
          <button
            onClick={() => toggleFaq(faq.id)}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
          >
            <span className="font-semibold text-[#211f1a] text-lg">{faq.question}</span>
            <ChevronDown
              size={24}
              className={`text-[#6B7280] flex-shrink-0 transition-transform ${
                openFaqId === faq.id ? "rotate-180" : ""
              }`}
            />
          </button>

          {openFaqId === faq.id && (
            <div className="px-6 pb-5">
              <p className="text-[#6B7280] leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}

      {/* Contact support */}
      <div className="text-center pt-8">
        <p className="text-[#6B7280] mb-4">Still have questions?</p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 border-2 border-[#ebe5d8] text-[#211f1a] rounded-[14px] font-medium hover:border-[#211f1a] transition-all"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
