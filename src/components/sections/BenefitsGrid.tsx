import type { CSSProperties } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * BenefitsGrid (How It Works) - Lia Design System
 *
 * Asymmetric process flow grid following Lia design principles:
 * - Clean typography with Geist Sans headings
 * - Bordered containers with no gaps
 * - Step labels and numbered badges
 * - Container 3 features mindmap-style process visualization
 * - Orange accent for visual hierarchy
 */
export function BenefitsGrid() {
  const steps = [
    {
      number: "01",
      label: "BRIEF",
      title: "Tell Us Your Needs",
      description:
        "Share your household requirements, preferences, and schedule through our simple intake form.",
    },
    {
      number: "02",
      label: "CURATE",
      title: "We Handpick Candidates",
      description:
        "Our team reviews hundreds of profiles to select the best matches based on your specific criteria.",
    },
    {
      number: "03",
      label: "PLACE",
      title: null,
      description: null,
    },
    {
      number: "03",
      label: "SUPPORT",
      title: "Meet and Hire",
      description:
        "Interview your top candidates and make your choice. We handle all contracts and onboarding.",
    },
  ];

  return (
    <section className="relative w-full bg-neutral-50 py-24 md:py-32">
      {/* Top Horizontal Divider - Connects vertical lines */}
      <div className="-translate-x-1/2 absolute top-0 left-1/2 h-px w-full max-w-[1320px] bg-neutral-200" />

      {/* Vertical Lines - Full height, aligned with container */}
      <div className="-translate-x-1/2 pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[1320px]">
        <div className="absolute inset-y-0 left-0 w-px bg-neutral-200" />
        <div className="absolute inset-y-0 right-0 w-px bg-neutral-200" />
      </div>

      <Container className="relative mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-[40px] border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          {/* Section Header - Swiss Typography */}
          <div className="border-neutral-200/80 border-b px-6 py-12 sm:px-12">
            <p className="mb-4 flex items-center gap-2 text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange-500" />
              In Action
            </p>
            <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              How It Works
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
              Three simple steps to finding your perfect household professional.
            </p>
          </div>

          {/* How It Works Grid - Aurius-style Asymmetric Layout */}
          <div className="grid border-neutral-200/80 border-t md:grid-cols-2 md:grid-rows-[auto_auto_auto]">
            {steps.map((step, index) => (
              <div
                className={cn(
                  "group relative border-neutral-200/80 border-b bg-white p-8 transition-all",
                  index === steps.length - 1 && "border-b-0",
                  index >= steps.length - 2 && "md:border-b-0",
                  (index === 1 || index === 3) && "md:border-r",
                  index === 0 && "md:col-span-2 md:border-r-0",
                  index === 2 && "overflow-hidden md:row-span-2 md:border-b-0"
                )}
                key={step.label}
              >
                {/* Container 3: Mindmap Visual */}
                {index === 2 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="flow-diagram flex w-full flex-col items-center gap-8 py-8">
                      {/* Trigger Node */}
                      <div
                        className="flow-node flow-node--muted flow-node--has-next flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-4 shadow-sm"
                        style={{ "--connector-length": "64px" } as CSSProperties}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                          <svg
                            aria-hidden="true"
                            className="h-6 w-6 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs uppercase tracking-wider">
                            Trigger
                          </div>
                          <div className="font-semibold text-lg text-neutral-900">
                            Brief Submitted
                          </div>
                        </div>
                      </div>

                      {/* Action Node */}
                      <div
                        className="flow-node flow-node--branch flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-4 shadow-sm"
                        style={{ "--branch-connector-length": "32px" } as CSSProperties}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                          <svg
                            aria-hidden="true"
                            className="h-6 w-6 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs uppercase tracking-wider">
                            Action
                          </div>
                          <div className="font-semibold text-lg text-neutral-900">
                            AI Matching & Curation
                          </div>
                        </div>
                      </div>

                      {/* Connector + Output Nodes */}
                      <div className="flow-branch w-full">
                        <div aria-hidden="true" className="flow-branch-rail" />
                        <div className="flow-leaves relative z-10 flex w-full gap-4">
                          <div className="flow-leaf flex-1">
                            <span aria-hidden="true" className="flow-leaf-line" />
                            <div className="flex items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <svg
                                  aria-hidden="true"
                                  className="h-5 w-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-orange-600 text-xs uppercase tracking-wider">
                                  Candidates
                                </div>
                                <div className="font-semibold text-neutral-900 text-sm">
                                  5 matched
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flow-leaf flex-1">
                            <span aria-hidden="true" className="flow-leaf-line" />
                            <div className="flex items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <svg
                                  aria-hidden="true"
                                  className="h-5 w-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-orange-600 text-xs uppercase tracking-wider">
                                  Timeline
                                </div>
                                <div className="font-semibold text-neutral-900 text-sm">
                                  5 business days
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 font-semibold text-neutral-900">
                        {step.number}
                      </div>
                      <div className="font-semibold text-neutral-400 text-xs uppercase tracking-[0.35em]">
                        {step.label}
                      </div>
                    </div>

                    {step.title && (
                      <div className="space-y-3">
                        <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-base text-neutral-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Bottom Horizontal Divider - Connects vertical lines */}
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-px w-full max-w-[1320px] bg-neutral-200" />
    </section>
  );
}
