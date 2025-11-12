"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * ServicesTabs Component
 *
 * Displays services in a tabbed interface.
 * Tabs are on the left, content panels on the right with images.
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
    <section className="w-full bg-stone-50 py-16 md:py-24">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="font-bold text-3xl text-stone-800 md:text-4xl">Our Services</h2>
          <p className="mt-4 text-lg text-stone-600">Premium household staff for every need.</p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[240px,1fr]">
          {/* Tabs - Left Side */}
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <button
                className={cn(
                  "rounded-lg px-4 py-3 text-left font-medium transition-all",
                  activeTab === service.id
                    ? "bg-stone-700 text-stone-50"
                    : "bg-transparent text-stone-700 hover:bg-stone-100"
                )}
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                type="button"
              >
                {service.label}
              </button>
            ))}
          </div>

          {/* Content Panel - Right Side */}
          <div className="rounded-2xl border-2 border-stone-300 bg-stone-100 p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Text Content */}
              <div>
                <h3 className="font-bold text-2xl text-stone-800">{activeService.title}</h3>
                <p className="mt-4 text-stone-600">{activeService.description}</p>
                <ul className="mt-6 space-y-3">
                  {activeService.features.map((feature) => (
                    <li className="flex items-start gap-3" key={feature}>
                      <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-stone-700">
                        <svg
                          className="h-3 w-3 text-stone-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </span>
                      <span className="text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  alt={activeService.title}
                  className="h-full w-full object-cover"
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
