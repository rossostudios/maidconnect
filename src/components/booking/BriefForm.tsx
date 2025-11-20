"use client";

/**
 * BriefForm - Complete Booking Brief Form
 *
 * Captures detailed booking requirements after market selection.
 * Pre-fills country, city, and service from URL params.
 *
 * Lia Design System with Anthropic rounded corners, orange accents.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMarket } from "@/lib/contexts/MarketContext";
import type { CountryCode } from "@/lib/shared/config/territories";

export function BriefForm() {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCountry, setCity, marketInfo } = useMarket();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceDetails: "",
    startDate: "",
    frequency: "once",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate market selection from URL params
  useEffect(() => {
    const country = searchParams.get("country");
    const city = searchParams.get("city");

    if (country) {
      setCountry(country as CountryCode);
    }
    if (city) {
      setCity(city);
    }
  }, [searchParams, setCountry, setCity]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Submit to backend API
      console.log("Form data:", {
        ...formData,
        country: marketInfo.countryName,
        city: marketInfo.cityName,
        service: searchParams.get("service"),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to confirmation
      router.push("/brief/confirmation");
    } catch (error) {
      console.error("Failed to submit brief:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceType = searchParams.get("service");

  return (
    <form onSubmit={handleSubmit}>
      {/* Market Summary */}
      <Card className="mb-6 border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-orange-500 p-1">
            <svg
              aria-label="Location icon"
              className="h-4 w-4 text-white"
              fill="none"
              role="img"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-neutral-900 text-sm">Your Selection</h3>
            <p className="text-neutral-700 text-sm">
              {marketInfo.cityName || marketInfo.countryName}
              {serviceType && ` · ${t(`services.${serviceType}.name`)}`}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-6 font-semibold text-2xl text-neutral-900">Tell Us About Your Needs</h2>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              className="mt-1"
              id="fullName"
              name="fullName"
              onChange={handleChange}
              placeholder="Andrea Martínez"
              required
              type="text"
              value={formData.fullName}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              className="mt-1"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="andrea@example.com"
              required
              type="email"
              value={formData.email}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              className="mt-1"
              id="phone"
              name="phone"
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              required
              type="tel"
              value={formData.phone}
            />
          </div>

          {/* Service Details */}
          <div>
            <Label htmlFor="serviceDetails">Service Details *</Label>
            <Textarea
              className="mt-1"
              id="serviceDetails"
              name="serviceDetails"
              onChange={handleChange}
              placeholder="Please describe your needs, preferred schedule, and any special requirements..."
              required
              rows={4}
              value={formData.serviceDetails}
            />
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Preferred Start Date *</Label>
            <Input
              className="mt-1"
              id="startDate"
              name="startDate"
              onChange={handleChange}
              required
              type="date"
              value={formData.startDate}
            />
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frequency *</Label>
            <select
              className="mt-1 flex h-10 w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              id="frequency"
              name="frequency"
              onChange={handleChange}
              required
              value={formData.frequency}
            >
              <option value="once">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="permanent">Permanent (full-time)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={() => router.back()} type="button" variant="outline">
            Back
          </Button>
          <Button className="flex-1" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting..." : "Submit Brief"} →
          </Button>
        </div>
      </Card>

      {/* Trust Badge */}
      <div className="mt-6 text-center text-neutral-600 text-sm">
        <p>
          🔒 Your information is secure and will only be used to match you with qualified
          professionals
        </p>
      </div>
    </form>
  );
}
