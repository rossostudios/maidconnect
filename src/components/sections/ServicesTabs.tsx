"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * ServicesTabs - Lia Design System
 *
 * Minimalist tabbed services display following Lia design principles:
 * - Clean vertical tab navigation
 * - Sharp corners (rounded-sm)
 * - Minimal borders
 * - Orange accent bars for features
 * - Satoshi for headings
 */
export function ServicesTabs() {
  const [activeTab, setActiveTab] = useState("housekeeping");

  const services = [
    {
      id: "housekeeping",
      label: "Housekeeping",
      title: "Professional Housekeeping",
      description:
        "Expert housekeepers who maintain your home to the highest standards. From daily cleaning to deep cleaning and organization, our professionals ensure your space is always pristine.",
      features: [
        "Daily or weekly cleaning schedules",
        "Deep cleaning and organization",
        "Laundry and ironing services",
        "Customized cleaning plans",
      ],
      image: "/services/housekeeping.jpg",
    },
    {
      id: "childcare",
      label: "Childcare",
      title: "Trusted Childcare",
      description:
        "Experienced nannies and babysitters who provide loving, attentive care for your children. All childcare professionals are thoroughly vetted and have verified experience.",
      features: [
        "Full-time or part-time nannies",
        "After-school care",
        "Educational activities",
        "First aid certified",
      ],
      image: "/services/childcare.jpg",
    },
    {
      id: "eldercare",
      label: "Eldercare",
      title: "Compassionate Eldercare",
      description:
        "Professional caregivers who provide dignified, compassionate care for elderly family members. Our team assists with daily activities while promoting independence and well-being.",
      features: [
        "Personal care assistance",
        "Medication reminders",
        "Companionship and activities",
        "Mobility support",
      ],
      image: "/services/eldercare.jpg",
    },
    {
      id: "relocation",
      label: "Relocation",
      title: "Seamless Relocation",
      description:
        "Comprehensive support for your move to Colombia. From finding housing to setting up utilities and navigating local bureaucracy, we handle every detail.",
      features: [
        "Housing search assistance",
        "Utility setup and coordination",
        "Local orientation tours",
        "Administrative support",
      ],
      image: "/services/relocation.jpg",
    },
  ];

  const activeService = services.find((s) => s.id === activeTab) ?? services[0]!;

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Section Header - Precision Typography */}
        <div className="mb-16">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            Our Services
          </h2>
          <div className="mt-4 h-1 w-16 bg-orange-500" />
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
            Premium household staff for every need.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[280px,1fr]">
          {/* Tabs - Left Side - Vertical Stack */}
          <div className="flex flex-col gap-1">
            {services.map((service) => (
              <button
                className={cn(
                  "group relative px-6 py-4 text-left transition-all",
                  activeTab === service.id
                    ? "bg-neutral-900 text-white"
                    : "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                type="button"
              >
                {/* Active Indicator - Orange Bar */}
                {activeTab === service.id && (
                  <div className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                )}

                <span className="font-[family-name:var(--font-geist-sans)] font-semibold text-base tracking-tight">
                  {service.label}
                </span>
              </button>
            ))}
          </div>

          {/* Content Panel - Right Side */}
          <div className="border border-neutral-200 bg-white p-8 md:p-12">
            <div className="grid gap-12 md:grid-cols-2">
              {/* Text Content */}
              <div>
                <h3 className="font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900 tracking-tight">
                  {activeService.title}
                </h3>

                <p className="mt-6 text-base text-neutral-600 leading-relaxed">
                  {activeService.description}
                </p>

                {/* Features List - Orange Accent Bars */}
                <ul className="mt-8 space-y-4">
                  {activeService.features.map((feature) => (
                    <li className="flex items-start gap-3" key={feature}>
                      {/* Orange Bar Instead of Circle */}
                      <div className="mt-2 h-px w-6 flex-shrink-0 bg-orange-500" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image - Grayscale */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-neutral-200 shadow-sm">
                <Image
                  alt={activeService.title}
                  className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={activeService.image}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
