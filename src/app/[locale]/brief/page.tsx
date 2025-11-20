import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Start Your Booking",
  description: "Tell us about your household staffing needs",
};

export default function BriefPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <Container className="max-w-screen-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-semibold text-4xl text-neutral-900 md:text-5xl">
            Find Your Perfect Match
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600 md:text-xl">
            Answer a few quick questions and we'll connect you with pre-vetted household
            professionals in your area
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <BookingWizard />
        </Suspense>
      </Container>
    </main>
  );
}
