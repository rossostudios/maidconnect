"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does MaidConnect verify professionals?",
    answer: "All professionals undergo a comprehensive screening process including background checks, reference verification, and skills assessment. We verify identity documents, work history, and conduct in-person interviews to ensure quality and safety.",
  },
  {
    question: "How do payments work?",
    answer: "When you book a service, we authorize a hold on your payment method. Funds are only captured after the service is completed. Professionals receive payment within 2-3 business days after service completion. All payments are processed securely through Stripe.",
  },
  {
    question: "What happens if I need to cancel?",
    answer: "You can cancel any booking before the scheduled start time through your dashboard. Cancellations made 24+ hours in advance receive a full refund. Cancellations within 24 hours may incur a cancellation fee to compensate the professional for their reserved time.",
  },
  {
    question: "Can I book recurring services?",
    answer: "Yes! During the booking process, you can set up recurring appointments on a weekly, biweekly, or monthly basis. This ensures you have consistent help and builds a long-term relationship with your preferred professional.",
  },
  {
    question: "What areas do you serve?",
    answer: "We currently operate across 6 major cities in Colombia including Bogotá, Medellín, Cali, Barranquilla, Cartagena, and Bucaramanga. We're actively expanding to new areas based on demand.",
  },
  {
    question: "How do I become a professional on MaidConnect?",
    answer: "Click 'Apply to join' and complete our application form. We'll review your information, conduct a background check, and schedule an interview. Once approved, you'll complete onboarding and can start accepting bookings. The entire process typically takes 5-7 business days.",
  },
];

export function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#fbfaf9] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <h2 className="mb-12 text-center text-4xl font-semibold text-[#211f1a] sm:text-5xl">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[24px] border border-[#ebe5d8] bg-white shadow-[0_4px_20px_rgba(18,17,15,0.02)] transition hover:shadow-[0_8px_30px_rgba(18,17,15,0.04)]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-8 text-left transition"
              >
                <span className="pr-8 text-xl font-semibold text-[#211f1a]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-6 w-6 flex-shrink-0 text-[#7d7566] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[#ebe5d8] p-8 pt-6">
                    <p className="text-base leading-relaxed text-[#5d574b]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
