import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { CustomerPendingReviews } from "@/components/reviews/customer-pending-reviews";
import { CustomerSubmittedReviews } from "@/components/reviews/customer-submitted-reviews";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

function ReviewsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-lg border border-neutral-200 bg-white p-6" key={i}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-neutral-200" />
              <div className="h-4 w-32 rounded bg-neutral-100" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CustomerReviewsPage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  // Fetch completed bookings that haven't been reviewed yet
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, service_name,
      professional:professional_profiles!professional_id(
        profile_id, full_name, avatar_url
      )`
    )
    .eq("customer_id", user.id)
    .eq("status", "completed")
    .order("scheduled_start", { ascending: false });

  // Fetch reviews already submitted by this customer
  const { data: submittedReviews } = await supabase
    .from("professional_reviews")
    .select(
      `id, rating, title, comment, created_at,
      professional:professional_profiles!professional_id(
        profile_id, full_name, avatar_url
      )`
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Get the professional IDs that have been reviewed
  const reviewedProfessionalIds = new Set(
    submittedReviews?.map((r) => r.professional?.profile_id).filter(Boolean) ?? []
  );

  // Filter out bookings where the professional has already been reviewed
  const pendingReviewBookings =
    completedBookings?.filter(
      (b) => b.professional && !reviewedProfessionalIds.has(b.professional.profile_id)
    ) ?? [];

  // Calculate stats
  const totalReviews = submittedReviews?.length ?? 0;
  const averageRating =
    totalReviews > 0
      ? (submittedReviews?.reduce((sum, r) => sum + r.rating, 0) ?? 0) / totalReviews
      : 0;
  const pendingCount = pendingReviewBookings.length;

  return (
    <>
      {/* Header */}
      <section className="mb-8">
        <div className="mb-6">
          <h1 className={cn("mb-2 font-bold text-3xl text-neutral-900", geistSans.className)}>
            Reviews
          </h1>
          <p className="text-neutral-600">
            Rate your experiences and help other customers find great professionals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
              <HugeiconsIcon className="h-5 w-5 text-orange-600" icon={StarIcon} />
            </div>
            <dt className="text-neutral-600 text-sm">Reviews Given</dt>
            <dd className={cn("mt-1 font-bold text-2xl text-neutral-900", geistSans.className)}>
              {totalReviews}
            </dd>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
              <HugeiconsIcon className="h-5 w-5 text-blue-600" icon={StarIcon} />
            </div>
            <dt className="text-neutral-600 text-sm">Average Rating</dt>
            <dd className={cn("mt-1 font-bold text-2xl text-neutral-900", geistSans.className)}>
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </dd>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50">
              <HugeiconsIcon className="h-5 w-5 text-yellow-600" icon={StarIcon} />
            </div>
            <dt className="text-neutral-600 text-sm">Pending Reviews</dt>
            <dd className={cn("mt-1 font-bold text-2xl text-neutral-900", geistSans.className)}>
              {pendingCount}
            </dd>
          </div>
        </div>
      </section>

      {/* Pending Reviews Section */}
      {pendingReviewBookings.length > 0 && (
        <section className="mb-8">
          <div className="mb-6">
            <h2 className={cn("mb-2 font-bold text-neutral-900 text-xl", geistSans.className)}>
              Pending Reviews
            </h2>
            <p className="text-neutral-600 text-sm">
              Share your feedback for these completed services
            </p>
          </div>
          <Suspense fallback={<ReviewsListSkeleton />}>
            <CustomerPendingReviews bookings={pendingReviewBookings} />
          </Suspense>
        </section>
      )}

      {/* Submitted Reviews Section */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className={cn("mb-2 font-bold text-neutral-900 text-xl", geistSans.className)}>
            Your Reviews
          </h2>
          <p className="text-neutral-600 text-sm">
            Reviews you&apos;ve submitted for professionals
          </p>
        </div>
        <Suspense fallback={<ReviewsListSkeleton />}>
          <CustomerSubmittedReviews reviews={submittedReviews ?? []} />
        </Suspense>
      </section>
    </>
  );
}
