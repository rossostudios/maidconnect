import { CustomerSupportIcon, MagicWand01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * BenefitsGrid (How It Works) - Swiss Design System
 *
 * Asymmetric process flow grid following Aurius design principles:
 * - Clean typography with Satoshi headings
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
      icon: Shield01Icon,
      title: "Tell Us Your Needs",
      description:
        "Share your household requirements, preferences, and schedule through our simple intake form.",
    },
    {
      number: "02",
      label: "CURATE",
      icon: MagicWand01Icon,
      title: "We Handpick Candidates",
      description:
        "Our team reviews hundreds of profiles to select the best matches based on your specific criteria.",
    },
    {
      number: "03",
      label: "PLACE",
      icon: null, // This will be the mindmap container
      title: null,
      description: null,
    },
    {
      number: "04",
      label: "SUPPORT",
      icon: CustomerSupportIcon,
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
        {/* Section Header - Swiss Typography */}
        <div className="mb-16">
          <h2
            className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
          >
            How It Works
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
            Three simple steps to finding your perfect household professional.
          </p>
        </div>

        {/* How It Works Grid - Aurius-style Asymmetric Layout */}
        <div className="grid md:grid-cols-2 md:grid-rows-[auto_auto_auto]">
          {steps.map((step, index) => (
            <div
              className={cn(
                "group relative border-neutral-200 bg-white p-8 transition-all",
                // Add borders for divider lines
                "border-r border-b",
                // Container 1: Full width at top with top border
                index === 0 && "border-t border-l md:col-span-2",
                // Container 2: Left side
                index === 1 && "border-l",
                // Container 3 (Mindmap): Right side, spans 2 rows
                index === 2 && "overflow-hidden md:row-span-2",
                // Container 4: Left side
                index === 3 && "border-l"
              )}
              key={step.label}
            >
              {/* Container 3: Mindmap Visual */}
              {index === 2 ? (
                <div className="flex h-full items-center justify-center">
                  {/* Mindmap Component */}
                  <div className="relative flex w-full flex-col items-center justify-center py-8">
                    {/* Trigger Node */}
                    <div className="flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-4 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <svg
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

                    {/* Connecting Line - Vertical Dotted with Animation */}
                    <div className="relative my-6 h-16">
                      <svg className="h-full w-px" preserveAspectRatio="none" viewBox="0 0 2 100">
                        <line
                          className="animate-dash"
                          stroke="#d4d4d8"
                          strokeDasharray="4 4"
                          strokeWidth="2"
                          x1="1"
                          x2="1"
                          y1="0"
                          y2="100"
                        />
                      </svg>
                    </div>

                    {/* Action Node */}
                    <div className="flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-4 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                        <svg
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

                    {/* Connecting Lines to Outputs - Simple Y-shaped pattern */}
                    <div className="relative my-6 h-16 w-full">
                      {/* Single SVG for proper Y-shaped connection */}
                      <svg
                        className="absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 200 100"
                      >
                        {/* Vertical line from center down */}
                        <line
                          className="animate-dash"
                          stroke="#d4d4d8"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          x1="100"
                          x2="100"
                          y1="0"
                          y2="50"
                        />
                        {/* Left diagonal to left output */}
                        <line
                          className="animate-dash"
                          stroke="#d4d4d8"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          x1="100"
                          x2="50"
                          y1="50"
                          y2="100"
                        />
                        {/* Right diagonal to right output */}
                        <line
                          className="animate-dash"
                          stroke="#d4d4d8"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          x1="100"
                          x2="150"
                          y1="50"
                          y2="100"
                        />
                      </svg>
                    </div>

                    {/* Output Nodes */}
                    <div className="flex w-full gap-4">
                      <div className="flex flex-1 items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                          <svg
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
                          <div className="font-semibold text-neutral-900 text-sm">5 matched</div>
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                          <svg
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
              ) : (
                <>
                  {/* Step Number - Top Right Corner */}
                  <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 font-mono text-sm text-white">
                    {step.number}
                  </div>

                  {/* Step Label - Top Left */}
                  <div className="mb-4 font-mono text-neutral-400 text-xs uppercase tracking-widest">
                    {step.label}
                  </div>

                  {/* Icon - Minimal Container */}
                  {step.icon && (
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-neutral-100 transition-colors group-hover:bg-orange-500">
                      <HugeiconsIcon
                        className="h-6 w-6 text-neutral-900 transition-colors group-hover:text-white"
                        icon={step.icon}
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  {/* Content */}
                  {step.title && (
                    <div className="space-y-3">
                      <h3
                        className="font-semibold text-2xl text-neutral-900 tracking-tight"
                        style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                      >
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
      </Container>

      {/* Bottom Horizontal Divider - Connects vertical lines */}
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-px w-full max-w-[1320px] bg-neutral-200" />
    </section>
  );
}
