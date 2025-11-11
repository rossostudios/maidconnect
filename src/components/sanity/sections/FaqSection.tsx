"use client";

/**
 * FAQ Section Component
 *
 * Renders FAQ section from Sanity CMS
 * Now using custom disclosure pattern (no Radix UI dependency)
 */

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Container } from "@/components/ui/container";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  data: {
    title?: string;
    subtitle?: string;
    faqs?: FaqItem[];
  };
};

export function FaqSection({ data }: FaqSectionProps) {
  const { title, subtitle, faqs } = data;

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f8fafc] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && <h2 className="serif-display-lg text-[#0f172a]">{title}</h2>}
            {subtitle && <p className="lead mt-4 text-[#0f172a]/70">{subtitle}</p>}
          </div>
        )}

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem answer={faq.answer} key={index} question={faq.question} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FaqItem({ question, answer }: FaqItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] transition-all hover:border-[#64748b]">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between p-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="font-semibold text-[#0f172a] text-lg">{question}</span>
        <HugeiconsIcon
          aria-hidden="true"
          className={`h-5 w-5 flex-shrink-0 text-[#94a3b8] transition-transform ${isOpen ? "rotate-45" : ""}`}
          icon={Add01Icon}
        />
      </button>

      {isOpen && (
        <div className="fade-in slide-in-from-top-2 animate-in px-6 pb-6 duration-200">
          <p className="text-[#0f172a]/70 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
