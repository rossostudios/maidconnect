"use client";

/**
 * FAQ Section Component
 *
 * Renders FAQ section from Sanity CMS.
 * Uses Accordion component (React Aria) instead of Radix Collapsible.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <section className="bg-neutral-50 py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && <h2 className="serif-display-lg text-neutral-900">{title}</h2>}
            {subtitle && <p className="lead mt-4 text-neutral-900/70">{subtitle}</p>}
          </div>
        )}

        <Accordion variant="default">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
