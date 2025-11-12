"use client";

/**
 * FAQ Section Component
 *
 * Renders FAQ section from Sanity CMS
 */

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
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
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && <h2 className="serif-display-lg text-[neutral-900]">{title}</h2>}
            {subtitle && <p className="lead mt-4 text-[neutral-900]/70">{subtitle}</p>}
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
    <Collapsible
      className="rounded-2xl border border-[neutral-200] bg-[neutral-50] transition-all hover:border-[neutral-500]"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left">
        <span className="font-semibold text-[neutral-900] text-lg">{question}</span>
        <HugeiconsIcon
          className={`h-5 w-5 flex-shrink-0 text-[neutral-400] transition-transform ${isOpen ? "rotate-45" : ""}`}
          icon={Add01Icon}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-6 pb-6">
        <p className="text-[neutral-900]/70 leading-relaxed">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
