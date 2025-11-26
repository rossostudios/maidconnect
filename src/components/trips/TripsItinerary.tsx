/**
 * TripsItinerary - Airbnb-Inspired Living Itinerary
 *
 * Main component for the customer's "Trips" view featuring:
 * - Upcoming trips section with countdown
 * - Past trips section with review prompts
 * - Empty state with booking CTA
 * - Visual timeline indicators
 *
 * Inspired by Airbnb's 2025 "Trips" living itinerary feature.
 *
 * Following Lia Design System.
 */

"use client";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { isPast } from "date-fns";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { type Trip, TripCard } from "./TripCard";

type TripsItineraryProps = {
  trips: Trip[];
  className?: string;
};

export function TripsItinerary({ trips, className }: TripsItineraryProps) {
  const [showAllPast, setShowAllPast] = useState(false);

  // Separate upcoming and past trips
  const { upcomingTrips, pastTrips, activeTrip } = useMemo(() => {
    const _now = new Date();

    const active = trips.find((t) => t.status === "in_progress");

    const upcoming = trips
      .filter((t) => {
        if (t.status === "in_progress") {
          return false;
        }
        if (t.status === "cancelled" || t.status === "completed") {
          return false;
        }
        if (!t.scheduled_start) {
          return t.status === "pending" || t.status === "confirmed";
        }
        return !isPast(new Date(t.scheduled_start));
      })
      .sort((a, b) => {
        if (!a.scheduled_start) {
          return 1;
        }
        if (!b.scheduled_start) {
          return -1;
        }
        return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime();
      });

    const past = trips
      .filter((t) => {
        if (t.status === "in_progress") {
          return false;
        }
        if (t.status === "completed" || t.status === "cancelled") {
          return true;
        }
        if (!t.scheduled_start) {
          return false;
        }
        return isPast(new Date(t.scheduled_start));
      })
      .sort((a, b) => {
        if (!a.scheduled_start) {
          return 1;
        }
        if (!b.scheduled_start) {
          return -1;
        }
        return new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime();
      });

    return {
      activeTrip: active,
      upcomingTrips: upcoming,
      pastTrips: past,
    };
  }, [trips]);

  const displayedPastTrips = showAllPast ? pastTrips : pastTrips.slice(0, 3);
  const hasNoTrips = !activeTrip && upcomingTrips.length === 0 && pastTrips.length === 0;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Empty State */}
      {hasNoTrips && <EmptyTripsState />}

      {/* Active Trip - Highlighted */}
      {activeTrip && (
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-babu-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-babu-500" />
            </div>
            <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              In Progress
            </h2>
          </div>
          <TripCard trip={activeTrip} variant="upcoming" />
        </motion.section>
      )}

      {/* Upcoming Trips Section */}
      {upcomingTrips.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rausch-100">
                <HugeiconsIcon className="h-4 w-4 text-rausch-600" icon={Calendar03Icon} />
              </div>
              <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
                Upcoming
              </h2>
              <Badge
                className="border-rausch-200 bg-rausch-50 text-rausch-600"
                size="sm"
                variant="outline"
              >
                {upcomingTrips.length}
              </Badge>
            </div>
            <Link
              className="flex items-center gap-1 text-rausch-600 text-sm hover:text-rausch-700"
              href="/dashboard/customer/bookings"
            >
              View all
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </Link>
          </div>

          {/* Timeline Visual */}
          <div className="relative space-y-4">
            {/* Timeline Line */}
            {upcomingTrips.length > 1 && (
              <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gradient-to-b from-rausch-200 to-transparent" />
            )}

            {upcomingTrips.map((trip, index) => (
              <div className="relative" key={trip.id}>
                {/* Timeline Dot */}
                {upcomingTrips.length > 1 && (
                  <div className="absolute top-6 left-3.5 z-10 h-3 w-3 rounded-full border-2 border-rausch-500 bg-white" />
                )}
                <div className={upcomingTrips.length > 1 ? "pl-10" : ""}>
                  <TripCard index={index} trip={trip} variant="upcoming" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Trips Section */}
      {pastTrips.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                <HugeiconsIcon className="h-4 w-4 text-neutral-600" icon={CheckmarkCircle02Icon} />
              </div>
              <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
                Past Trips
              </h2>
              <Badge
                className="border-neutral-200 bg-neutral-50 text-neutral-600"
                size="sm"
                variant="outline"
              >
                {pastTrips.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {displayedPastTrips.map((trip, index) => (
              <TripCard index={index} key={trip.id} trip={trip} variant="past" />
            ))}
          </div>

          {pastTrips.length > 3 && !showAllPast && (
            <motion.div
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
            >
              <Button
                className="text-neutral-600"
                onClick={() => setShowAllPast(true)}
                variant="ghost"
              >
                Show {pastTrips.length - 3} more past trips
              </Button>
            </motion.div>
          )}
        </section>
      )}

      {/* Quick Booking CTA */}
      {!hasNoTrips && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="rounded-lg border border-neutral-300 border-dashed bg-neutral-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rausch-100">
              <HugeiconsIcon className="h-6 w-6 text-rausch-600" icon={SparklesIcon} />
            </div>
            <h3 className={cn("font-semibold text-base text-neutral-900", geistSans.className)}>
              Book your next service
            </h3>
            <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
              Find trusted professionals in your area
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/professionals">
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={Search01Icon} />
                Browse Professionals
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EmptyTripsState() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-neutral-200 bg-white p-12 text-center"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rausch-100">
        <HugeiconsIcon className="h-8 w-8 text-rausch-600" icon={Calendar03Icon} />
      </div>
      <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
        No trips yet
      </h2>
      <p className={cn("mx-auto mt-2 max-w-sm text-neutral-600 text-sm", geistSans.className)}>
        Your upcoming and past bookings will appear here. Start exploring trusted professionals in
        your area.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/professionals">
            <HugeiconsIcon className="mr-2 h-5 w-5" icon={Search01Icon} />
            Find Professionals
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">
            <HugeiconsIcon className="mr-2 h-5 w-5" icon={SparklesIcon} />
            Explore Services
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
