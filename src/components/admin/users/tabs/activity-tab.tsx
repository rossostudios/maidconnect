/**
 * User Details - Activity Tab
 *
 * Displays bookings, portfolio (professionals), addresses, and favorites (customers)
 */

"use client";

import { memo } from "react";
import { formatCOP } from "@/lib/utils/format";
import { SectionCard } from "./shared-components";
import { ActivitySkeleton } from "./skeletons";
import type { BaseUser } from "./types";

type ActivityTabProps = {
  user: BaseUser;
  data?: unknown;
};

type BookingCardProps = {
  name: string;
  service: string;
  status: "upcoming" | "completed" | "cancelled";
  date: string;
  time: string;
  amount: number;
  address?: string;
  type: "professional" | "customer";
};

type PortfolioCardProps = {
  image_url: string;
  title: string;
};

type AddressCardProps = {
  label: string;
  address: string;
  city: string;
  is_default: boolean;
};

type FavoriteCardProps = {
  name: string;
  services: string[];
};

/**
 * BookingCard - Memoized to prevent re-renders in booking lists
 */
const BookingCard = memo(function BookingCard({
  name,
  service,
  status,
  date,
  time,
  amount,
  address,
  type,
}: BookingCardProps) {
  const statusConfig = {
    upcoming: { color: "bg-babu-50 border-babu-600 text-babu-900", text: "Upcoming" },
    completed: { color: "bg-green-50 border-green-600 text-green-900", text: "Completed" },
    cancelled: { color: "bg-red-50 border-red-600 text-red-900", text: "Cancelled" },
  };

  const config = statusConfig[status];

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {type === "professional" ? `Customer: ${name}` : `Professional: ${name}`}
          </p>
          <p className="text-neutral-700 text-sm">{service}</p>
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
        >
          {config.text}
        </span>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">Date:</span> {date} at {time}
        </p>
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">Amount:</span> {formatCOP(amount)}
        </p>
        {address && (
          <p className="text-neutral-700 md:col-span-2">
            <span className="font-medium text-neutral-900">Address:</span> {address}
          </p>
        )}
      </div>
    </div>
  );
});

/**
 * PortfolioCard - Displays portfolio item
 */
function PortfolioCard({ image_url, title }: PortfolioCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="aspect-video rounded-t-lg bg-neutral-100">
        {/* Placeholder for image - will use Next Image in real implementation */}
        <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
          {image_url}
        </div>
      </div>
      <div className="border-neutral-200 border-t p-3">
        <p className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm">
          {title}
        </p>
      </div>
    </div>
  );
}

/**
 * AddressCard - Displays saved address
 */
function AddressCard({ label, address, city, is_default }: AddressCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
          {label}
        </p>
        {is_default && (
          <span className="inline-block rounded-full border border-rausch-600 bg-rausch-50 px-2 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-rausch-900 text-xs tracking-wider">
            Default
          </span>
        )}
      </div>
      <p className="text-neutral-700 text-sm">{address}</p>
      <p className="text-neutral-600 text-sm">{city}</p>
    </div>
  );
}

/**
 * FavoriteCard - Displays favorite professional
 */
function FavoriteCard({ name, services }: FavoriteCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
        {name}
      </p>
      <div className="flex flex-wrap gap-2">
        {services.map((service, idx) => (
          <span
            className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-neutral-700 text-xs"
            key={idx}
          >
            {service}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * ActivityTab - Lia Design System
 * Professional-focused booking lists, portfolio, and customer addresses
 * Memoized to prevent re-renders when other tabs change
 */
export const ActivityTab = memo(function ActivityTab({ user, data }: ActivityTabProps) {
  if (!data) {
    return <ActivitySkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data (from /api/admin/users/[id]/activity)
  const apiData = data as any;
  const professionalActivity =
    isProfessional && apiData?.professional
      ? {
          bookings: apiData.professional.bookings || [],
          portfolio: apiData.professional.portfolio || [],
        }
      : null;

  const customerActivity =
    isCustomer && apiData?.customer
      ? {
          bookings: apiData.customer.bookings || [],
          addresses: apiData.customer.addresses || [],
          favorites: apiData.customer.favorites || [],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalActivity && (
        <>
          {/* Bookings List */}
          <SectionCard title="Bookings">
            <div className="space-y-4">
              {professionalActivity.bookings.map((booking: any) => (
                <BookingCard
                  address={booking.address}
                  amount={booking.amount}
                  date={booking.date}
                  key={booking.id}
                  name={booking.customer_name}
                  service={booking.service}
                  status={booking.status as "upcoming" | "completed" | "cancelled"}
                  time={booking.time}
                  type="professional"
                />
              ))}
              {professionalActivity.bookings.length === 0 && (
                <p className="text-neutral-600 text-sm">No bookings yet</p>
              )}
            </div>
          </SectionCard>

          {/* Portfolio Gallery */}
          <SectionCard title="Portfolio">
            <div className="grid gap-4 md:grid-cols-3">
              {professionalActivity.portfolio.map((item: any) => (
                <PortfolioCard image_url={item.image_url} key={item.id} title={item.title} />
              ))}
            </div>
            {professionalActivity.portfolio.length === 0 && (
              <p className="text-neutral-600 text-sm">No portfolio items added yet</p>
            )}
          </SectionCard>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerActivity && (
        <>
          {/* Bookings List */}
          <SectionCard title="Booking History">
            <div className="space-y-4">
              {customerActivity.bookings.map((booking: any) => (
                <BookingCard
                  amount={booking.amount}
                  date={booking.date}
                  key={booking.id}
                  name={booking.professional_name}
                  service={booking.service}
                  status={booking.status as "upcoming" | "completed" | "cancelled"}
                  time={booking.time}
                  type="customer"
                />
              ))}
              {customerActivity.bookings.length === 0 && (
                <p className="text-neutral-600 text-sm">No booking history</p>
              )}
            </div>
          </SectionCard>

          {/* Saved Addresses */}
          <SectionCard title="Saved Addresses">
            <div className="space-y-4">
              {customerActivity.addresses.map((address: any) => (
                <AddressCard
                  address={address.street_address || ""}
                  city={address.city || ""}
                  is_default={address.is_default}
                  key={address.id}
                  label={address.address_type || "Address"}
                />
              ))}
            </div>
            {customerActivity.addresses.length === 0 && (
              <p className="text-neutral-600 text-sm">No saved addresses</p>
            )}
          </SectionCard>

          {/* Favorite Professionals */}
          <SectionCard title="Favorite Professionals">
            <div className="space-y-4">
              {customerActivity.favorites.map((favorite: any) => (
                <FavoriteCard
                  key={favorite.id}
                  name={favorite.name || "Unknown"}
                  services={favorite.specialties || []}
                />
              ))}
            </div>
            {customerActivity.favorites.length === 0 && (
              <p className="text-neutral-600 text-sm">No favorite professionals</p>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
});
