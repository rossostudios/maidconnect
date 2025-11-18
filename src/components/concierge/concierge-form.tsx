"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock01Icon,
  GlobeIcon,
  MagicWand01Icon,
  Shield01Icon,
  Tick02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

// Simpler schema for concierge requests
const conciergeSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  serviceType: z.string().min(1, "Please describe what you need"),
  message: z.string().optional(),
});

type ConciergeFormData = z.infer<typeof conciergeSchema>;

export function ConciergeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConciergeFormData>({
    resolver: zodResolver(conciergeSchema),
  });

  const onSubmit = async (data: ConciergeFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // Track conversion
      conversionTracking.conciergeRequestStarted({ serviceType: data.serviceType });

      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      const { briefId } = await response.json();

      conversionTracking.conciergeRequestSubmitted({
        briefId,
        serviceType: data.serviceType,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting concierge request:", error);
      setErrorMessage("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      /* Success State */
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, scale: 0.95 }}
      >
        <div className="rounded-lg border border-neutral-200 bg-white p-12 shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-sm">
            <HugeiconsIcon className="h-12 w-12 text-green-600" icon={Tick02Icon} size={48} />
          </div>

          <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">Request Received!</h2>
          <p className="mb-8 text-lg text-neutral-600 leading-relaxed">
            Thank you for choosing Casaora Direct Hire. Our team will review your request and reach
            out within 2 hours during business hours (Mon-Fri, 9am-6pm COT). $299 one-time fee for permanent placement with legal contracts.
          </p>

          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-blue-900 text-sm">
              📧 Check your email for a confirmation message. If you don't see it, please check your
              spam folder.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline">Learn How Casaora Works</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 font-[family-name:var(--font-geist-sans)] font-semibold text-orange-600 text-sm shadow-sm">
          <HugeiconsIcon className="h-4 w-4" icon={MagicWand01Icon} size={16} />
          Direct Hire Program
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 sm:text-5xl">
          Permanent Placement with Legal Contracts
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-neutral-600 leading-relaxed">
          $299 one-time fee for full-time placements. Our white-glove team handles everything from matching to legal contracts and 30-day replacement guarantee.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon
              className="h-6 w-6 text-orange-600"
              icon={UserMultiple02Icon}
              size={24}
            />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">Personal Coordinator</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Dedicated English-speaking coordinator who understands expat needs and manages your
            entire search.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Shield01Icon} size={24} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">Curated Matches</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            We handpick 3–5 thoroughly vetted professionals who perfectly match your specific
            requirements.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Clock01Icon} size={24} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">5-Day Guarantee</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Receive detailed professional profiles with bios, references, and availability within 5
            business days.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={GlobeIcon} size={24} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">Bilingual Support</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Communicate entirely in English throughout the entire process — from search to hiring.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Tick02Icon} size={24} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">Interview Coordination</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            We schedule and facilitate video or in-person interviews, and help negotiate terms in
            English or Spanish.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shadow-sm">
            <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={MagicWand01Icon} size={24} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">Ongoing Support</h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Continued assistance after hiring with contract templates, payment setup, and any issues
            that arise.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-16 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="bg-neutral-50 p-6">
          <h2 className="text-center font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
            Direct Hire vs. Instant Book
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-neutral-200 border-b bg-neutral-50">
              <tr>
                <th className="p-4 text-left font-semibold text-neutral-700">Feature</th>
                <th className="p-4 text-center font-semibold text-neutral-700">
                  Instant Book
                  <div className="mt-1 font-normal text-neutral-700 text-xs">15% fee on hourly jobs</div>
                </th>
                <th className="p-4 text-center font-semibold text-orange-600">
                  Direct Hire
                  <div className="mt-1 font-normal text-orange-500 text-xs">$299 one-time fee</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="p-4 text-neutral-700">Browse and search professionals</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-green-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
                <td className="p-4 text-center text-neutral-600">—</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Personal coordinator</td>
                <td className="p-4 text-center text-neutral-600">—</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-orange-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Curated matches delivered to you</td>
                <td className="p-4 text-center text-neutral-600">—</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-orange-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Interview scheduling assistance</td>
                <td className="p-4 text-center text-neutral-600">—</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-orange-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Contract & payment setup help</td>
                <td className="p-4 text-center text-neutral-600">—</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-orange-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Ongoing support after hiring</td>
                <td className="p-4 text-center text-neutral-600">—</td>
                <td className="p-4 text-center">
                  <HugeiconsIcon
                    className="mx-auto h-5 w-5 text-orange-600"
                    icon={Tick02Icon}
                    size={20}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Best for</td>
                <td className="p-4 text-center text-neutral-600 text-sm">One-time jobs, recurring tasks, hourly help</td>
                <td className="p-4 text-center text-orange-600 text-sm">
                  Full-time staff, permanent placements, live-in nannies
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Form */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-lg sm:p-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">Request Direct Hire Service</h2>
          <p className="text-neutral-600 leading-relaxed">
            Fill out this short form and we'll respond within 2 hours (during business hours). $299 one-time fee for permanent placements.
          </p>
        </div>

        <form className="mx-auto max-w-xl space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="name">
              Your Name <span className="text-orange-500">*</span>
            </label>
            <Input id="name" {...register("name")} className="w-full" placeholder="John Doe" />
            {errors.name && <p className="mt-1 text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="email">
              Email Address <span className="text-orange-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="w-full"
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="phone">
              Phone Number (Optional)
            </label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-700 text-sm"
              htmlFor="serviceType"
            >
              What type of help do you need? <span className="text-orange-500">*</span>
            </label>
            <Input
              id="serviceType"
              {...register("serviceType")}
              className="w-full"
              placeholder="E.g., Full-time housekeeper, part-time nanny, estate manager..."
            />
            {errors.serviceType && (
              <p className="mt-1 text-red-600 text-sm">{errors.serviceType.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="message">
              Additional Details (Optional)
            </label>
            <Textarea
              id="message"
              {...register("message")}
              className="w-full"
              placeholder="Tell us about your schedule, special requirements, budget, or any other preferences..."
              rows={4}
            />
          </div>

          {errorMessage && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full font-[family-name:var(--font-geist-sans)] font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isSubmitting}
              size="lg"
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Request Direct Hire Service"}
            </Button>
          </div>

          <div className="text-center text-neutral-600 text-sm">
            <p>
              Or prefer to fill out a detailed brief?{" "}
              <Link className="text-orange-600" href="/brief">
                Start the full intake form
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 text-center text-neutral-600 text-sm">
        <p>
          🔒 Your information is secure and confidential. We'll only use it to match you with
          suitable professionals.
        </p>
      </div>
    </>
  );
}
