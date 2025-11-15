"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What types of household professionals does Casaora provide?",
    answer:
      "Casaora connects households with top-tier domestic professionals including housekeepers, nannies, personal chefs, estate managers, private drivers, and specialized care providers. All candidates are carefully vetted and represent the top 5% in their field.",
  },
  {
    question: "How does Casaora vet and background-check candidates?",
    answer:
      "Every professional undergoes a comprehensive screening process including identity verification, criminal background checks, reference verification, skills assessments, and in-person interviews. We partner with leading background check providers to ensure the highest safety standards.",
  },
  {
    question: "Can you support part-time and full-time placements?",
    answer:
      "Yes, we accommodate both part-time and full-time positions. Whether you need someone a few hours per week or a live-in professional, we can match you with candidates who fit your specific schedule and household requirements.",
  },
  {
    question: "What cities does Casaora operate in?",
    answer:
      "Casaora currently serves major metropolitan areas across Colombia including Bogotá, Medellín, Cali, and Barranquilla. We are expanding to additional cities and can accommodate special requests for other regions.",
  },
  {
    question: "How long does it usually take to find a match?",
    answer:
      "Most households are matched with qualified candidates within 7-14 days. The timeline depends on your specific requirements, availability needs, and location. Rush placements can often be accommodated for urgent needs.",
  },
  {
    question: "What ongoing support does Casaora offer after hiring?",
    answer:
      "We provide continuous support throughout the employment relationship including performance check-ins, conflict resolution assistance, replacement guarantees, and access to our client success team. Your satisfaction is our priority.",
  },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <Container className="max-w-6xl">
        <div className="grid border-2 border-neutral-200 bg-white md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Left Column */}
          <div className="flex flex-col gap-6 p-8 md:p-10 lg:p-12">
            <div className="inline-flex">
              <span className="font-semibold text-orange-500 text-sm uppercase tracking-wider">
                FAQ
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 leading-tight md:text-5xl">
              Frequently asked questions
            </h2>
            <p className="text-base text-neutral-700 leading-relaxed">
              Everything you need to know about connecting with Colombia's finest household
              professionals through Casaora.
            </p>
          </div>

          {/* Right Column - Accordion */}
          <div className="flex flex-col border-neutral-200 border-t-2 md:border-t-0 md:border-l-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div className={"border-neutral-200 border-b-2 last:border-b-0"} key={index}>
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:text-orange-600 md:p-8"
                    onClick={() => toggleItem(index)}
                    type="button"
                  >
                    <span className="font-[family-name:var(--font-geist-sans)] font-semibold text-lg text-neutral-900">
                      {item.question}
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-6 pb-6 text-base text-neutral-700 leading-relaxed md:px-8 md:pb-8"
                      role="region"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
