# Reviews & Ratings System

**Status:** Production Ready
**Last Updated:** 2025-11-06
**Maintainer:** Technical Leadership Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Two-Way Review System Architecture](#2-two-way-review-system-architecture)
3. [Database Schema](#3-database-schema)
4. [Customer Review Flow](#4-customer-review-flow)
5. [Professional Review Flow](#5-professional-review-flow)
6. [Rating Calculation & Display](#6-rating-calculation--display)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Validation & Type Safety](#8-validation--type-safety)
9. [UI Components](#9-ui-components)
10. [Admin Professional Review](#10-admin-professional-review)
11. [Review Moderation](#11-review-moderation)
12. [Analytics & Metrics](#12-analytics--metrics)
13. [Mobile Implementation](#13-mobile-implementation)
14. [Security Considerations](#14-security-considerations)
15. [Implementation Guide](#15-implementation-guide)
16. [Help Center Content](#16-help-center-content)
17. [Troubleshooting Guide](#17-troubleshooting-guide)
18. [Future Enhancements](#18-future-enhancements)

---

## 1. Overview

### What is the Reviews & Ratings System?

MaidConnect implements a **two-way review system** that promotes mutual accountability between customers and cleaning professionals. Unlike traditional one-sided review platforms, both parties rate each other after completed bookings.

### Key Features

✅ **Two-Way Reviews:**
- Customers rate professionals (public)
- Professionals rate customers (private)

✅ **Verified Bookings Only:**
- Only users with completed bookings can leave reviews
- Prevents fake or spam reviews

✅ **Detailed Category Ratings:**
- Overall rating (1-5 stars)
- Category-specific ratings (punctuality, communication, respectfulness)

✅ **Public Transparency:**
- Professional reviews visible to all users
- Customer reviews private (visible only to customer and professional)

✅ **Real-Time Calculations:**
- Average ratings computed on-demand
- No stale denormalized data

✅ **Admin Review System:**
- Separate workflow for approving professional applications
- Document verification and background checks

---

## 2. Two-Way Review System Architecture

### A. Customer → Professional Reviews

**Purpose:** Build trust and help customers choose qualified professionals

**Visibility:** ✅ **Public** (visible to all users on professional profiles)

**Characteristics:**
- Simple 5-star rating
- Optional title and comment
- Reviewer name displayed (or "Verified household" if anonymous)
- Chronological display (newest first)
- No category breakdowns (overall impression only)

**Use Cases:**
- Help new customers evaluate professionals
- Provide feedback to professionals
- Build professional reputation scores
- SEO benefits (user-generated content)

---

### B. Professional → Customer Reviews

**Purpose:** Enable professionals to identify problematic customers and maintain mutual respect

**Visibility:** 🔒 **Private** (only visible to customer and professional)

**Characteristics:**
- Overall rating (1-5 stars)
- Category ratings: punctuality, communication, respectfulness
- Optional title and comment
- Tied to specific booking (one review per booking)
- Can be updated after submission

**Use Cases:**
- Help professionals avoid difficult customers
- Provide constructive feedback to customers
- Mutual accountability system
- Prevent customer abuse/exploitation

**Privacy Rationale:**
- Prevents public shaming of customers
- Encourages honest feedback from professionals
- Maintains customer dignity while providing accountability

---

## 3. Database Schema

### A. Professional Reviews Table

**Table:** `public.professional_reviews`

**Migration:** `/supabase/migrations-archive/20250102143000_extend_bookings_and_reviews.sql`

```sql
CREATE TABLE public.professional_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  professional_id uuid NOT NULL REFERENCES professional_profiles(profile_id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Review Content
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  reviewer_name text, -- Optional anonymized name

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_professional_reviews_professional_id
  ON public.professional_reviews(professional_id);

CREATE INDEX idx_professional_reviews_customer_id
  ON public.professional_reviews(customer_id);

CREATE INDEX idx_professional_reviews_created_at
  ON public.professional_reviews(created_at DESC);
```

**Key Points:**
- ✅ No unique constraint (customers can review same professional multiple times for different bookings)
- ✅ `reviewer_name` allows anonymization ("Verified household" fallback)
- ✅ Cascade deletion if professional or customer account deleted
- ✅ Simple schema optimized for read-heavy workload

---

### B. Customer Reviews Table

**Table:** `public.customer_reviews`

**Migration:** `/supabase/migrations-archive/20250102151000_create_customer_reviews_table.sql`

```sql
CREATE TABLE public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships (tied to specific booking)
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professional_profiles(profile_id) ON DELETE CASCADE,

  -- Overall Rating
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),

  -- Category Ratings (Optional)
  punctuality_rating integer CHECK (punctuality_rating BETWEEN 1 AND 5),
  communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
  respectfulness_rating integer CHECK (respectfulness_rating BETWEEN 1 AND 5),

  -- Review Content
  title text,
  comment text,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ONE REVIEW PER BOOKING CONSTRAINT (prevents duplicates)
CREATE UNIQUE INDEX customer_reviews_booking_professional_unique_idx
  ON customer_reviews(booking_id, professional_id);

-- Indexes
CREATE INDEX idx_customer_reviews_customer_id
  ON public.customer_reviews(customer_id);

CREATE INDEX idx_customer_reviews_professional_id
  ON public.customer_reviews(professional_id);

CREATE INDEX idx_customer_reviews_booking_id
  ON public.customer_reviews(booking_id);

-- Auto-update updated_at timestamp
CREATE TRIGGER set_customer_reviews_updated_at
  BEFORE UPDATE ON public.customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Key Points:**
- ✅ **Unique constraint** prevents multiple reviews for same booking
- ✅ **Detailed category ratings** for customer behavior analysis
- ✅ **Updateable** (professionals can revise reviews)
- ✅ **Tied to bookings** (stronger data integrity than professional reviews)
- ✅ Automatic `updated_at` trigger

---

### C. Database Types (TypeScript)

**File:** `/src/types/database.types.ts`

```typescript
// Generated from Supabase
export type Database = {
  public: {
    Tables: {
      professional_reviews: {
        Row: {
          id: string;
          professional_id: string;
          customer_id: string;
          rating: number; // 1-5
          title: string | null;
          comment: string | null;
          reviewer_name: string | null;
          created_at: string; // ISO timestamp
        };
        Insert: {
          id?: string;
          professional_id: string;
          customer_id: string;
          rating: number;
          title?: string | null;
          comment?: string | null;
          reviewer_name?: string | null;
          created_at?: string;
        };
        Update: {
          // No UPDATE policy - reviews cannot be edited
        };
      };

      customer_reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          rating: number; // 1-5
          punctuality_rating: number | null; // 1-5
          communication_rating: number | null; // 1-5
          respectfulness_rating: number | null; // 1-5
          title: string | null;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          rating: number;
          punctuality_rating?: number | null;
          communication_rating?: number | null;
          respectfulness_rating?: number | null;
          title?: string | null;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          punctuality_rating?: number | null;
          communication_rating?: number | null;
          respectfulness_rating?: number | null;
          title?: string | null;
          comment?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
```

---

## 4. Customer Review Flow

### A. Review Submission Component

**File:** `/src/components/professionals/professional-reviews.tsx`

**Location:** Embedded on professional profile page (`/professionals/[id]`)

**Eligibility Check:**
```typescript
// Only show form if user has completed booking with this professional
const { data: completedBooking } = await supabase
  .from("bookings")
  .select("id, status")
  .eq("customer_id", user.id)
  .eq("professional_id", professionalId)
  .eq("status", "completed")
  .maybeSingle();

const canLeaveReview = !!completedBooking;
```

**Form UI:**
```tsx
<form action={submitReviewAction} className="space-y-4">
  {/* Hidden Fields */}
  <input type="hidden" name="professionalId" value={professionalId} />

  {/* Rating Selector */}
  <div className="flex flex-col gap-2">
    <label htmlFor="rating" className="text-sm font-medium">
      Rating *
    </label>
    <select
      name="rating"
      id="rating"
      required
      defaultValue="5"
      className="rounded-lg border px-3 py-2"
    >
      {[5, 4, 3, 2, 1].map((value) => (
        <option key={value} value={value}>
          {value} {value === 1 ? "star" : "stars"}
        </option>
      ))}
    </select>
  </div>

  {/* Title (Optional) */}
  <div className="flex flex-col gap-2">
    <label htmlFor="title" className="text-sm font-medium">
      Headline
    </label>
    <input
      type="text"
      name="title"
      id="title"
      placeholder="Sum up your experience"
      className="rounded-lg border px-3 py-2"
    />
  </div>

  {/* Comment (Required) */}
  <div className="flex flex-col gap-2">
    <label htmlFor="comment" className="text-sm font-medium">
      Your review *
    </label>
    <textarea
      name="comment"
      id="comment"
      required
      rows={4}
      placeholder="Share your experience with this professional..."
      className="rounded-lg border px-3 py-2"
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={pending}
    className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
  >
    {pending ? "Submitting..." : "Post review"}
  </button>
</form>
```

---

### B. Server Action (Submit Professional Review)

**File:** `/src/app/actions/submit-professional-review.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server-client';

export async function submitProfessionalReviewAction(formData: FormData) {
  try {
    // 1. Extract and validate form data
    const professionalId = formData.get("professionalId") as string;
    const ratingValue = formData.get("rating");
    const title = formData.get("title") as string | null;
    const comment = formData.get("comment") as string | null;

    // Validate rating
    const rating = ratingValue ? parseInt(ratingValue as string, 10) : NaN;
    if (!isFinite(rating) || rating < 1 || rating > 5) {
      return {
        status: "error",
        message: "Please provide a rating between 1 and 5."
      };
    }

    // Validate comment (required)
    if (!comment || comment.trim().length < 10) {
      return {
        status: "error",
        message: "Please provide a review with at least 10 characters."
      };
    }

    // 2. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { status: "error", message: "You must be signed in to leave a review." };
    }

    // 3. CRITICAL: Verify user has completed booking with this professional
    const { data: completedBooking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("customer_id", user.id)
      .eq("professional_id", professionalId)
      .eq("status", "completed")
      .maybeSingle();

    if (bookingError || !completedBooking) {
      return {
        status: "error",
        message: "You can only review professionals you've worked with."
      };
    }

    // 4. Check for existing review (prevent duplicates)
    const { data: existingReview } = await supabase
      .from("professional_reviews")
      .select("id")
      .eq("professional_id", professionalId)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return {
        status: "error",
        message: "You have already reviewed this professional."
      };
    }

    // 5. Get reviewer name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const reviewerName = profile?.full_name ?? "Verified household";

    // 6. Insert review
    const { error: insertError } = await supabase
      .from("professional_reviews")
      .insert({
        professional_id: professionalId,
        customer_id: user.id,
        rating,
        title: title || null,
        comment: comment.trim(),
        reviewer_name: reviewerName,
      });

    if (insertError) {
      console.error("Insert review error:", insertError);
      return {
        status: "error",
        message: "Failed to submit review. Please try again."
      };
    }

    // 7. Revalidate professional profile page
    revalidatePath(`/professionals/${professionalId}`);
    revalidatePath(`/en/professionals/${professionalId}`);
    revalidatePath(`/es/professionals/${professionalId}`);

    return {
      status: "success",
      message: "Thank you! Your review has been posted."
    };

  } catch (error) {
    console.error("Submit professional review error:", error);
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again."
    };
  }
}
```

**Key Security Measures:**
1. ✅ **Authentication check** - User must be signed in
2. ✅ **Booking verification** - Must have completed booking with professional
3. ✅ **Duplicate prevention** - Check for existing review
4. ✅ **Input validation** - Rating range and comment length checks
5. ✅ **XSS prevention** - Supabase parameterized queries
6. ✅ **Error handling** - Graceful failures with user-friendly messages

---

### C. Review Display Component

**File:** `/src/components/professionals/professional-reviews.tsx`

```tsx
type ProfessionalReviewSummary = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
};

export function ProfessionalReviewsList({ reviews }: { reviews: ProfessionalReviewSummary[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this professional!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border bg-[#fbfafa] p-5">
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-2">
            <StarIcon className="size-5 fill-red-600 stroke-red-600" />
            <span className="font-semibold text-lg">
              {review.rating.toFixed(1)}
            </span>
          </div>

          {/* Title (if provided) */}
          {review.title && (
            <p className="font-semibold text-gray-900 mb-2">
              {review.title}
            </p>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-600 mb-3 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Reviewer Name + Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p className="uppercase font-medium">
              {review.reviewerName ?? "Verified household"}
            </p>
            <time dateTime={review.createdAt}>
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

---

## 5. Professional Review Flow

### A. Pending Ratings List

**File:** `/src/components/reviews/pending-ratings-list.tsx`

**Location:** Professional dashboard (`/dashboard/pro`)

**Purpose:** Show professionals which bookings need customer reviews

```tsx
export async function PendingRatingsList({ professionalId }: { professionalId: string }) {
  const supabase = await createClient();

  // Fetch completed bookings without reviews
  const { data: pendingBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      scheduled_start,
      customer:profiles!bookings_customer_id_fkey(full_name),
      customer_reviews!left(id)
    `)
    .eq("professional_id", professionalId)
    .eq("status", "completed")
    .is("customer_reviews.id", null) // No review yet
    .order("scheduled_start", { ascending: false });

  if (!pendingBookings || pendingBookings.length === 0) {
    return <p className="text-gray-500">All caught up! 🎉</p>;
  }

  return (
    <ul className="space-y-3">
      {pendingBookings.map((booking) => (
        <li key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{booking.customer.full_name}</p>
            <p className="text-sm text-gray-500">
              {new Date(booking.scheduled_start).toLocaleDateString()}
            </p>
          </div>

          <RatingPromptModal bookingId={booking.id} customerId={booking.customer.id} />
        </li>
      ))}
    </ul>
  );
}
```

---

### B. Rating Prompt Modal

**File:** `/src/components/reviews/rating-prompt-modal.tsx`

**Purpose:** Interactive modal for professionals to rate customers

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StarIcon } from '@/components/icons';

export function RatingPromptModal({ bookingId, customerId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState<number | null>(null);
  const [communicationRating, setCommunicationRating] = useState<number | null>(null);
  const [respectfulnessRating, setRespectfulnessRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await submitCustomerReviewAction({
        bookingId,
        customerId,
        rating: overallRating,
        punctualityRating,
        communicationRating,
        respectfulnessRating,
        title: title || null,
        comment: comment || null,
      });

      if (result.status === "success") {
        setIsOpen(false);
        // Show toast notification
      } else {
        // Show error message
      }
    } catch (error) {
      console.error("Submit review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-red-600 hover:underline">
          Rate Customer
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            label="Overall Experience"
            value={overallRating}
            onChange={setOverallRating}
            required
          />

          {/* Category Ratings (Optional) */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Optional: Rate specific aspects
            </p>

            <StarRating
              label="Punctuality"
              value={punctualityRating}
              onChange={setPunctualityRating}
            />

            <StarRating
              label="Communication"
              value={communicationRating}
              onChange={setCommunicationRating}
            />

            <StarRating
              label="Respectfulness"
              value={respectfulnessRating}
              onChange={setRespectfulnessRating}
            />
          </div>

          {/* Title (Optional) */}
          <input
            type="text"
            placeholder="Headline (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Comment (Optional) */}
          <textarea
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Star Rating Component
function StarRating({ label, value, onChange, required = false }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = hoveredRating || value || 0;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {label} {required && "*"}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <StarIcon
              className={`size-8 ${
                star <= displayRating
                  ? "fill-red-600 stroke-red-600"
                  : "fill-none stroke-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {value && (
        <span className="text-xs text-gray-500">
          {value} {value === 1 ? "star" : "stars"}
        </span>
      )}
    </div>
  );
}
```

---

### C. Server Action (Submit Customer Review)

**File:** `/src/app/actions/submit-customer-review.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server-client';
import {
  validateReviewInput,
  validateBookingAuthorization,
  parseReviewRatings,
} from '@/lib/reviews/review-validation-service';

type SubmitCustomerReviewInput = {
  bookingId: string;
  customerId: string;
  rating: number;
  punctualityRating?: number | null;
  communicationRating?: number | null;
  respectfulnessRating?: number | null;
  title?: string | null;
  comment?: string | null;
};

export async function submitCustomerReviewAction(input: SubmitCustomerReviewInput) {
  try {
    // 1. Validate input
    const validationResult = validateReviewInput(input);
    if (!validationResult.isValid) {
      return { status: "error", message: validationResult.error };
    }

    // 2. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { status: "error", message: "Authentication required." };
    }

    // 3. Verify booking authorization (professional can only review their own customers)
    const authResult = await validateBookingAuthorization(
      supabase,
      input.bookingId,
      input.customerId,
      user.id
    );

    if (!authResult.isValid) {
      return { status: "error", message: authResult.error };
    }

    // 4. Parse optional category ratings
    const categoryRatings = parseReviewRatings({
      punctuality: input.punctualityRating,
      communication: input.communicationRating,
      respectfulness: input.respectfulnessRating,
    });

    // 5. Insert review (unique constraint prevents duplicates)
    const { error: insertError } = await supabase
      .from("customer_reviews")
      .insert({
        booking_id: input.bookingId,
        customer_id: input.customerId,
        professional_id: user.id,
        rating: input.rating,
        punctuality_rating: categoryRatings.punctuality,
        communication_rating: categoryRatings.communication,
        respectfulness_rating: categoryRatings.respectfulness,
        title: input.title || null,
        comment: input.comment || null,
      });

    if (insertError) {
      // Check if duplicate review (unique constraint violation)
      if (insertError.code === "23505") {
        return {
          status: "error",
          message: "You have already reviewed this customer for this booking."
        };
      }

      console.error("Insert customer review error:", insertError);
      return {
        status: "error",
        message: "Failed to submit review. Please try again."
      };
    }

    // 6. Revalidate professional dashboard
    revalidatePath("/dashboard/pro");
    revalidatePath("/en/dashboard/pro");
    revalidatePath("/es/dashboard/pro");

    return {
      status: "success",
      message: "Review submitted successfully!"
    };

  } catch (error) {
    console.error("Submit customer review error:", error);
    return {
      status: "error",
      message: "An unexpected error occurred."
    };
  }
}
```

---

### D. Review Validation Service

**File:** `/src/lib/reviews/review-validation-service.ts`

**Purpose:** Reusable validation helpers for review submissions

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

// Validate review input
export function validateReviewInput(input: {
  rating: number;
  bookingId: string;
  customerId: string;
}) {
  // Rating check
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return {
      isValid: false,
      error: "Rating must be between 1 and 5 stars."
    };
  }

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(input.bookingId)) {
    return {
      isValid: false,
      error: "Invalid booking ID."
    };
  }

  if (!uuidRegex.test(input.customerId)) {
    return {
      isValid: false,
      error: "Invalid customer ID."
    };
  }

  return { isValid: true };
}

// Validate booking authorization
export async function validateBookingAuthorization(
  supabase: SupabaseClient,
  bookingId: string,
  customerId: string,
  professionalId: string
) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, status, professional_id, customer_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    return {
      isValid: false,
      error: "Booking not found."
    };
  }

  // Verify professional owns this booking
  if (booking.professional_id !== professionalId) {
    return {
      isValid: false,
      error: "You can only review customers from your own bookings."
    };
  }

  // Verify customer ID matches
  if (booking.customer_id !== customerId) {
    return {
      isValid: false,
      error: "Customer ID mismatch."
    };
  }

  // Verify booking is completed
  if (booking.status !== "completed") {
    return {
      isValid: false,
      error: "You can only review completed bookings."
    };
  }

  return { isValid: true };
}

// Parse optional category ratings
export function parseReviewRatings(ratings: {
  punctuality?: number | null;
  communication?: number | null;
  respectfulness?: number | null;
}) {
  const parsed: {
    punctuality: number | null;
    communication: number | null;
    respectfulness: number | null;
  } = {
    punctuality: null,
    communication: null,
    respectfulness: null,
  };

  // Validate each rating if provided
  for (const [key, value] of Object.entries(ratings)) {
    if (value !== null && value !== undefined) {
      const numValue = Number(value);
      if (Number.isInteger(numValue) && numValue >= 1 && numValue <= 5) {
        parsed[key as keyof typeof parsed] = numValue;
      }
    }
  }

  return parsed;
}
```

---

## 6. Rating Calculation & Display

### A. On-the-Fly Calculation (Professional Profile)

**File:** `/src/app/[locale]/professionals/[id]/page.tsx`

```typescript
export default async function ProfessionalProfilePage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const { id: profileId } = await params;
  const supabase = await createClient();

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from("professional_reviews")
    .select("id, rating, title, comment, reviewer_name, created_at")
    .eq("professional_id", profileId)
    .order("created_at", { ascending: false });

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const reviewCount = reviews?.length ?? 0;

  return (
    <div>
      {/* Rating Badge */}
      <div className="flex items-center gap-2">
        <StarIcon className="size-6 fill-red-600" />
        <span className="text-2xl font-bold">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-gray-500">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      </div>

      {/* Reviews List */}
      <ProfessionalReviewsList reviews={reviews ?? []} />
    </div>
  );
}
```

**Pros:**
- ✅ Always accurate (no stale data)
- ✅ Simple implementation
- ✅ No need to update denormalized columns

**Cons:**
- ⚠️ Slower for professionals with 100+ reviews
- ⚠️ Requires fetching all reviews even for just average

---

### B. Database Function (Active Professionals List)

**File:** `/supabase/migrations-archive/20251101000005_fix_reviews_table_name.sql`

**Purpose:** Efficiently compute average rating for search results

```sql
CREATE OR REPLACE FUNCTION list_active_professionals(
  p_city text DEFAULT NULL,
  p_service_types text[] DEFAULT NULL,
  p_max_hourly_rate integer DEFAULT NULL,
  p_min_rating numeric DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  profile_id uuid,
  full_name text,
  hourly_rate integer,
  rating numeric,
  review_count bigint,
  -- ... other fields
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.profile_id,
    p.full_name,
    pp.hourly_rate,

    -- Calculate average rating
    COALESCE(
      (SELECT AVG(r.rating)::numeric
       FROM public.professional_reviews r
       WHERE r.professional_id = pp.profile_id),
      0
    ) AS rating,

    -- Count reviews
    COALESCE(
      (SELECT COUNT(*)
       FROM public.professional_reviews r
       WHERE r.professional_id = pp.profile_id),
      0
    ) AS review_count,

    -- ... other fields

  FROM public.professional_profiles pp
  INNER JOIN public.profiles p ON pp.profile_id = p.id
  WHERE
    pp.is_available = true
    AND (p_city IS NULL OR pp.city ILIKE '%' || p_city || '%')
    AND (p_min_rating IS NULL OR (
      SELECT AVG(r.rating)::numeric
      FROM public.professional_reviews r
      WHERE r.professional_id = pp.profile_id
    ) >= p_min_rating)
  ORDER BY rating DESC NULLS LAST, review_count DESC
  LIMIT p_limit;
END;
$$;
```

**Usage:**
```typescript
// Fetch professionals with ratings
const { data: professionals } = await supabase
  .rpc('list_active_professionals', {
    p_city: 'Medellín',
    p_min_rating: 4.5,
    p_limit: 10,
  });

// professionals[0].rating => 4.8
// professionals[0].review_count => 127
```

**Pros:**
- ✅ High performance (subquery caching)
- ✅ Filter by min_rating in SQL
- ✅ No N+1 queries

**Cons:**
- ⚠️ More complex SQL
- ⚠️ Requires SECURITY DEFINER (admin privileges)

---

### C. Rating Distribution Component

**File:** `/src/components/analytics/rating-distribution.tsx`

**Purpose:** Visualize rating breakdown for analytics

```tsx
type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

export function RatingDistribution({ reviews }: { reviews: { rating: number }[] }) {
  // Calculate breakdown
  const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      breakdown[review.rating as keyof RatingBreakdown]++;
    }
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Calculate satisfaction rate (% of 4-5 star reviews)
  const satisfactionRate = totalReviews > 0
    ? ((breakdown[5] + breakdown[4]) / totalReviews) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">
          {averageRating.toFixed(1)}
        </div>
        <div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`size-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-red-600 stroke-red-600"
                    : "fill-none stroke-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = breakdown[rating as keyof RatingBreakdown];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm font-medium w-8">{rating} ⭐</span>

              {/* Progress Bar */}
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="text-sm text-gray-600 w-16 text-right">
                {count} ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rate */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">Satisfaction Rate</p>
        <p className="text-2xl font-bold text-green-600">
          {satisfactionRate.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500">
          Based on 4-5 star reviews
        </p>
      </div>
    </div>
  );
}
```

**Visual Output:**
```
4.8 ⭐⭐⭐⭐⭐
500 reviews

5 ⭐ ████████████████████████ 350 (70.0%)
4 ⭐ ████████████ 100 (20.0%)
3 ⭐ ████ 30 (6.0%)
2 ⭐ ██ 15 (3.0%)
1 ⭐ █ 5 (1.0%)

Satisfaction Rate
90.0%
Based on 4-5 star reviews
```

---

## 7. Row Level Security (RLS)

### A. Professional Reviews (Public)

**Purpose:** Anyone can read professional reviews, only customers can write

```sql
-- Enable RLS
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can read reviews (public visibility)
CREATE POLICY "Reviews are readable by anyone"
ON public.professional_reviews
FOR SELECT
USING (true);

-- INSERT: Only authenticated customers can insert
CREATE POLICY "Customers can insert their own reviews"
ON public.professional_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- UPDATE: Not allowed (reviews cannot be edited)
-- No UPDATE policy

-- DELETE: Not allowed (reviews cannot be deleted by users)
-- No DELETE policy
```

**Security Notes:**
- ✅ **Public read access** - Builds trust, improves SEO
- ✅ **Authenticated insert** - Prevents anonymous spam
- ✅ **Customer ownership** - User can only insert with their own `customer_id`
- ⚠️ **No editing** - Reviews are permanent (consider adding UPDATE policy for typo fixes)
- ⚠️ **No deletion** - Once posted, reviews cannot be removed (except by admin via SQL)

---

### B. Customer Reviews (Private)

**Purpose:** Mutual visibility between customer and professional only

```sql
-- Enable RLS
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: Customers can view reviews about themselves
CREATE POLICY "Customers can view their own reviews"
ON public.customer_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

-- SELECT: Professionals can view reviews they wrote
CREATE POLICY "Professionals can view reviews they wrote"
ON public.customer_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

-- INSERT: Professionals can insert reviews for completed bookings
CREATE POLICY "Professionals can insert reviews for completed bookings"
ON public.customer_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = professional_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_id
    AND professional_id = auth.uid()
    AND status = 'completed'
  )
);

-- UPDATE: Professionals can update their own reviews
CREATE POLICY "Professionals can update their own reviews"
ON public.customer_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);

-- DELETE: Not allowed
-- No DELETE policy
```

**Security Notes:**
- ✅ **Private visibility** - Only customer and professional can see
- ✅ **Verified bookings** - Must be completed booking
- ✅ **Editable** - Professionals can update reviews (fix mistakes)
- ✅ **No public access** - Prevents customer shaming
- ✅ **Unique constraint** - Database enforces one review per booking

---

## 8. Validation & Type Safety

### Current Implementation

**Status:** ⚠️ **Manual validation (not using Zod)**

**Example from codebase:**
```typescript
// Manual validation (current)
const rating = ratingValue ? parseInt(ratingValue as string, 10) : NaN;
if (!isFinite(rating) || rating < 1 || rating > 5) {
  return { status: "error", message: "Please provide a rating between 1 and 5." };
}
```

---

### Recommended Implementation (Zod)

**Per CLAUDE.md guidelines:**

```typescript
// ✅ CORRECT: Use Zod for validation
import { z } from 'zod';

// Professional review schema
export const ProfessionalReviewSchema = z.object({
  professionalId: z.string().uuid("Invalid professional ID"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .min(1)
    .max(100, "Title must be 100 characters or less")
    .optional()
    .nullable(),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be 500 characters or less"),
});

export type ProfessionalReviewData = z.infer<typeof ProfessionalReviewSchema>;

// Customer review schema
export const CustomerReviewSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  customerId: z.string().uuid("Invalid customer ID"),
  rating: z.number().int().min(1).max(5),
  punctualityRating: z.number().int().min(1).max(5).optional().nullable(),
  communicationRating: z.number().int().min(1).max(5).optional().nullable(),
  respectfulnessRating: z.number().int().min(1).max(5).optional().nullable(),
  title: z.string().min(1).max(100).optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
});

export type CustomerReviewData = z.infer<typeof CustomerReviewSchema>;

// Usage in Server Action
export async function submitProfessionalReviewAction(formData: FormData) {
  try {
    // Parse and validate with Zod
    const input = ProfessionalReviewSchema.parse({
      professionalId: formData.get("professionalId"),
      rating: Number(formData.get("rating")),
      title: formData.get("title") || null,
      comment: formData.get("comment"),
    });

    // input is now type-safe and validated
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: error.errors[0].message,
      };
    }
    throw error;
  }
}
```

**Benefits:**
- ✅ **Type safety** - Infer TypeScript types from schemas
- ✅ **Clear error messages** - User-friendly validation errors
- ✅ **Reusable schemas** - Share between client and server
- ✅ **Follows CLAUDE.md** - Aligns with project standards

---

## 9. UI Components

### A. Component Structure

**Directory:** `/src/components/`

```
components/
├── professionals/
│   └── professional-reviews.tsx        # Review list + submission form
├── reviews/
│   ├── rating-prompt-modal.tsx         # Professional rates customer
│   ├── pending-ratings-list.tsx        # Bookings needing reviews
│   └── star-rating.tsx                 # Reusable star picker
└── analytics/
    └── rating-distribution.tsx         # Rating breakdown charts
```

---

### B. Star Rating Component (Reusable)

**File:** `/src/components/reviews/star-rating.tsx`

```tsx
'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/icons';

type StarRatingProps = {
  label: string;
  value: number | null;
  onChange: (rating: number) => void;
  required?: boolean;
  disabled?: boolean;
};

export function StarRating({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = hoveredRating || value || 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      {/* Star Buttons */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={disabled}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StarIcon
              className={`size-8 ${
                star <= displayRating
                  ? "fill-red-600 stroke-red-600"
                  : "fill-none stroke-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating Label */}
      {value !== null && value > 0 && (
        <span className="text-xs text-gray-500">
          {value} {value === 1 ? "star" : "stars"}
        </span>
      )}
    </div>
  );
}
```

**Usage:**
```tsx
const [rating, setRating] = useState(5);

<StarRating
  label="Overall Experience"
  value={rating}
  onChange={setRating}
  required
/>
```

---

### C. Review Card Component

**File:** `/src/components/professionals/professional-reviews.tsx`

```tsx
type ReviewCardProps = {
  review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    reviewerName: string | null;
    createdAt: string;
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-[#fbfafa] p-5 shadow-sm">
      {/* Rating Badge */}
      <div className="flex items-center gap-2 mb-2">
        <StarIcon className="size-5 fill-red-600 stroke-red-600" />
        <span className="font-semibold text-lg text-gray-900">
          {review.rating.toFixed(1)}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {review.title}
        </h3>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-600 mb-4 leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Footer: Reviewer + Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
        <p className="uppercase font-medium">
          {review.reviewerName ?? "Verified household"}
        </p>
        <time dateTime={review.createdAt}>
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
    </article>
  );
}
```

---

### D. Empty State Component

```tsx
export function EmptyReviews({ userCanReview = false }: { userCanReview?: boolean }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-gray-100 mb-4">
        <StarIcon className="size-8 fill-none stroke-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No reviews yet
      </h3>

      <p className="text-gray-600">
        {userCanReview
          ? "Be the first to share your experience!"
          : "This professional hasn't received any reviews yet."
        }
      </p>
    </div>
  );
}
```

---

## 10. Admin Professional Review

**Purpose:** Admins review *professional applications* (NOT customer reviews)

**Separate System:** This is distinct from the customer review system

### A. Admin Review Modal

**File:** `/src/components/admin/professional-review-modal.tsx`

**Features:**
- View professional application details
- Verify documents (ID, certifications)
- Check references and background
- Approve/reject/request more info
- Send notification emails

**Actions:**
```typescript
type ReviewAction =
  | 'approve'        // Change status to 'active'
  | 'reject'         // Change status to 'rejected'
  | 'request_info';  // Keep 'pending', send email
```

---

### B. Professional Review Service

**File:** `/src/lib/admin/professional-review-service.ts`

```typescript
export async function createProfessionalReview(
  supabase: SupabaseClient,
  input: {
    professionalId: string;
    action: 'approve' | 'reject' | 'request_info';
    notes?: string;
    verificationsCompleted?: string[];
  },
  adminId: string
) {
  // 1. Validate input
  const validation = validateReviewInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  // 2. Get professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*, profiles(*)')
    .eq('profile_id', input.professionalId)
    .single();

  if (!profile) {
    return { success: false, error: 'Professional not found' };
  }

  // 3. Determine new status
  const newStatus = determineNewStatus(input.action, profile.onboarding_status);

  // 4. Create admin review record
  const { error: reviewError } = await supabase
    .from('admin_professional_reviews')
    .insert({
      professional_id: input.professionalId,
      admin_id: adminId,
      action: input.action,
      notes: input.notes,
      verifications_completed: input.verificationsCompleted,
      review_status: newStatus,
    });

  if (reviewError) {
    return { success: false, error: 'Failed to create review record' };
  }

  // 5. Update professional status
  const { error: statusError } = await supabase
    .from('professional_profiles')
    .update({ onboarding_status: newStatus })
    .eq('profile_id', input.professionalId);

  if (statusError) {
    return { success: false, error: 'Failed to update status' };
  }

  // 6. Send notification email
  await sendReviewNotificationEmail({
    professionalEmail: profile.profiles.email,
    action: input.action,
    notes: input.notes,
  });

  return { success: true };
}
```

---

### C. Admin Review Table

**Table:** `admin_professional_reviews`

```sql
CREATE TABLE public.admin_professional_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(profile_id),
  admin_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'request_info')),
  notes text,
  verifications_completed text[],
  review_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 11. Review Moderation

### Current State

**Status:** ⚠️ **No customer review moderation system**

**What exists:**
- ✅ Verification that user completed booking
- ✅ Duplicate review prevention
- ✅ Input validation (rating range, length limits)

**What's missing:**
- ❌ No content moderation (profanity, spam)
- ❌ No flagging/reporting mechanism
- ❌ No admin review queue
- ❌ No dispute resolution
- ❌ No automated filtering

---

### Recommended Moderation System

**A. Flagging Mechanism:**

```typescript
// Add to professional_reviews table
ALTER TABLE professional_reviews ADD COLUMN is_flagged boolean DEFAULT false;
ALTER TABLE professional_reviews ADD COLUMN flag_reason text;
ALTER TABLE professional_reviews ADD COLUMN flagged_at timestamptz;
ALTER TABLE professional_reviews ADD COLUMN flagged_by uuid REFERENCES profiles(id);

// Flag review mutation
export async function flagReview(reviewId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required' };

  await supabase
    .from('professional_reviews')
    .update({
      is_flagged: true,
      flag_reason: reason,
      flagged_at: new Date().toISOString(),
      flagged_by: user.id,
    })
    .eq('id', reviewId);

  return { success: true };
}
```

**B. Admin Moderation Queue:**

```typescript
// Fetch flagged reviews
const { data: flaggedReviews } = await supabase
  .from('professional_reviews')
  .select('*, professional:profiles(*), flagger:profiles!flagged_by(*)')
  .eq('is_flagged', true)
  .order('flagged_at', { ascending: false });

// Admin actions: approve, remove, warn professional
```

**C. Automated Filtering:**

```typescript
import { moderateContent } from '@/lib/content-moderation';

export async function submitReviewWithModeration(input: ReviewInput) {
  // Check for profanity
  const moderationResult = await moderateContent(input.comment);

  if (moderationResult.containsProfanity) {
    return {
      error: 'Your review contains inappropriate language. Please revise.',
    };
  }

  // Check for spam patterns
  if (moderationResult.isSpam) {
    return {
      error: 'Your review appears to be spam.',
    };
  }

  // Proceed with submission
  await insertReview(input);
}
```

---

## 12. Analytics & Metrics

### A. Key Metrics to Track

**Review Volume:**
- Total reviews per professional
- Reviews per month (trend)
- Average reviews per booking (%)
- Review submission rate after booking completion

**Rating Distribution:**
- Average rating per professional
- Rating distribution (5★, 4★, 3★, 2★, 1★)
- Satisfaction rate (% 4-5 star reviews)
- Rating changes over time

**Customer Behavior:**
- Time to first review (after booking)
- Customers who review multiple times
- Customers with no reviews

**Professional Behavior:**
- Professionals who consistently get 5★ reviews
- Professionals with declining ratings
- Response to negative reviews (future feature)

---

### B. SQL Queries for Analytics

**Average rating per professional:**
```sql
SELECT
  p.full_name,
  AVG(r.rating)::numeric(3,2) AS avg_rating,
  COUNT(r.id) AS review_count
FROM professional_reviews r
INNER JOIN profiles p ON r.professional_id = p.id
GROUP BY p.id, p.full_name
ORDER BY avg_rating DESC;
```

**Rating distribution:**
```sql
SELECT
  rating,
  COUNT(*) AS count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM professional_reviews
GROUP BY rating
ORDER BY rating DESC;
```

**Top-rated professionals (min 10 reviews):**
```sql
SELECT
  p.full_name,
  AVG(r.rating)::numeric(3,2) AS avg_rating,
  COUNT(r.id) AS review_count
FROM professional_reviews r
INNER JOIN profiles p ON r.professional_id = p.id
GROUP BY p.id, p.full_name
HAVING COUNT(r.id) >= 10
ORDER BY avg_rating DESC, review_count DESC
LIMIT 10;
```

**Review submission rate (% of completed bookings with reviews):**
```sql
SELECT
  COUNT(DISTINCT b.id) AS total_completed_bookings,
  COUNT(DISTINCT r.id) AS bookings_with_reviews,
  ROUND(100.0 * COUNT(DISTINCT r.id) / COUNT(DISTINCT b.id), 2) AS review_rate_percentage
FROM bookings b
LEFT JOIN professional_reviews r ON b.customer_id = r.customer_id AND b.professional_id = r.professional_id
WHERE b.status = 'completed';
```

**Monthly review trends:**
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS review_count,
  AVG(rating)::numeric(3,2) AS avg_rating
FROM professional_reviews
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC;
```

---

### C. Analytics Dashboard Component

**File:** `/src/components/analytics/reviews-dashboard.tsx`

```tsx
export async function ReviewsDashboard({ professionalId }: { professionalId: string }) {
  const supabase = await createClient();

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('professional_reviews')
    .select('rating, created_at')
    .eq('professional_id', professionalId);

  if (!reviews || reviews.length === 0) {
    return <EmptyState />;
  }

  // Calculate metrics
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const totalReviews = reviews.length;
  const satisfactionRate = (reviews.filter(r => r.rating >= 4).length / totalReviews) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Metric Cards */}
      <MetricCard
        label="Average Rating"
        value={avgRating.toFixed(1)}
        icon={<StarIcon className="fill-red-600" />}
      />

      <MetricCard
        label="Total Reviews"
        value={totalReviews.toString()}
        icon={<MessageIcon />}
      />

      <MetricCard
        label="Satisfaction Rate"
        value={`${satisfactionRate.toFixed(0)}%`}
        icon={<ThumbsUpIcon />}
        subtitle="4-5 star reviews"
      />

      {/* Rating Distribution */}
      <div className="md:col-span-3">
        <RatingDistribution reviews={reviews} />
      </div>

      {/* Monthly Trend Chart */}
      <div className="md:col-span-3">
        <MonthlyTrendChart reviews={reviews} />
      </div>
    </div>
  );
}
```

---

## 13. Mobile Implementation

**File:** `/mobile/components/reviews/review-form.tsx`

**Status:** ✅ Exists (mobile app has native review functionality)

**Features:**
- Native star rating UI (iOS/Android)
- Touch-optimized form inputs
- Real-time validation feedback
- Offline submission queue (submits when reconnected)
- Push notifications for review prompts

**Differences from Web:**
- Uses React Native components
- Native gestures (swipe to rate)
- Optimized for mobile performance
- Offline-first architecture

---

## 14. Security Considerations

### ✅ Implemented Security Measures

1. **Verified Bookings Only:**
   - Customers must have completed booking with professional
   - Professionals must have completed booking with customer
   - Database-level foreign key constraints

2. **Authentication Required:**
   - All review submissions require valid Supabase session
   - RLS policies enforce authentication

3. **Duplicate Prevention:**
   - Customer reviews: Unique constraint `(booking_id, professional_id)`
   - Professional reviews: Application-level check

4. **Input Validation:**
   - Rating range checks (1-5)
   - Length limits (title: 100 chars, comment: 500 chars)
   - XSS prevention via parameterized queries

5. **RLS Policies:**
   - Professional reviews: Public read, authenticated insert
   - Customer reviews: Private, mutual visibility only

6. **Ownership Verification:**
   - Users can only insert reviews with their own user ID
   - Cannot impersonate other users

---

### ⚠️ Security Gaps

1. **No Content Moderation:**
   - No profanity filter
   - No spam detection
   - Malicious content can be posted

2. **No Rate Limiting:**
   - Could spam review submissions
   - No CAPTCHA or bot protection

3. **No Review Editing:**
   - Professional reviews cannot be corrected (typo mistakes permanent)
   - Should add UPDATE policy with time limit

4. **No Dispute Resolution:**
   - False/malicious reviews cannot be challenged
   - No formal dispute process

5. **No Anonymization:**
   - Reviewer names visible (privacy concern for some users)
   - Should offer "Anonymous" option

---

## 15. Implementation Guide

### For Developers

#### A. Add Review Submission to Your Page

**1. Check if user can review:**
```typescript
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // User not logged in - don't show form
  return null;
}

const { data: completedBooking } = await supabase
  .from('bookings')
  .select('id')
  .eq('customer_id', user.id)
  .eq('professional_id', professionalId)
  .eq('status', 'completed')
  .maybeSingle();

const canReview = !!completedBooking;
```

**2. Display review form:**
```tsx
{canReview && (
  <ProfessionalReviewForm professionalId={professionalId} />
)}
```

**3. Handle submission:**
```typescript
'use client';

export function ProfessionalReviewForm({ professionalId }: Props) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await submitProfessionalReviewAction(formData);

      if (result.status === 'success') {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

#### B. Display Reviews with Rating

**1. Fetch reviews:**
```typescript
const { data: reviews } = await supabase
  .from('professional_reviews')
  .select('id, rating, title, comment, reviewer_name, created_at')
  .eq('professional_id', professionalId)
  .order('created_at', { ascending: false });

const avgRating = reviews && reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  : 0;
```

**2. Display rating badge:**
```tsx
<div className="flex items-center gap-2">
  <StarIcon className="size-6 fill-red-600" />
  <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
  <span className="text-gray-500">
    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
  </span>
</div>
```

**3. Display review list:**
```tsx
<ProfessionalReviewsList reviews={reviews} />
```

---

#### C. Add Professional Rating System

**1. Show pending ratings list:**
```tsx
// In professional dashboard
<PendingRatingsList professionalId={user.id} />
```

**2. Implement rating modal:**
```tsx
<RatingPromptModal
  bookingId={booking.id}
  customerId={booking.customer_id}
/>
```

**3. Handle submission:**
```typescript
const result = await submitCustomerReviewAction({
  bookingId,
  customerId,
  rating: 5,
  punctualityRating: 5,
  communicationRating: 4,
  respectfulnessRating: 5,
  title: 'Great customer!',
  comment: 'Very respectful and clear communication.',
});
```

---

#### D. Implement Zod Validation (Recommended)

**1. Create schemas:**
```typescript
// lib/validations/reviews.ts
import { z } from 'zod';

export const ProfessionalReviewSchema = z.object({
  professionalId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().min(10).max(500),
});

export type ProfessionalReviewData = z.infer<typeof ProfessionalReviewSchema>;
```

**2. Use in Server Actions:**
```typescript
export async function submitProfessionalReviewAction(formData: FormData) {
  try {
    const input = ProfessionalReviewSchema.parse({
      professionalId: formData.get('professionalId'),
      rating: Number(formData.get('rating')),
      title: formData.get('title') || null,
      comment: formData.get('comment'),
    });

    // input is now validated and type-safe
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'error', message: error.errors[0].message };
    }
  }
}
```

---

## 16. Help Center Content

### For Customers

#### How do I leave a review for a professional?

**You can leave a review after completing a booking:**

1. **Visit the professional's profile page**
2. **Scroll down to the "Reviews" section**
3. **If you've completed a booking with them, you'll see a review form**
4. **Fill in your rating (1-5 stars), optional headline, and your review**
5. **Click "Post review"**

**Requirements:**
- ✅ You must be signed in
- ✅ You must have a completed booking with this professional
- ✅ Review must be at least 10 characters

**Your review will appear publicly on the professional's profile immediately.**

---

#### Can I edit or delete my review after posting?

**No, reviews cannot be edited or deleted after posting.**

**Why:**
- Maintains review integrity
- Prevents manipulation of ratings
- Builds trust in the platform

**If you made a mistake:**
- Contact support at support@casaora.co
- We can remove reviews that violate our terms (spam, profanity, false claims)
- Genuine reviews stay visible

---

#### What if I want to leave an anonymous review?

**Your review will show your name by default.**

If you don't want your full name visible:
1. Update your profile name to initials (e.g., "J.D.")
2. Leave your review
3. It will show as "J.D." on the professional's profile

**Alternatively:**
- If your name is not set, reviews show as **"Verified household"**

**Note:** Professionals can still see your booking history, so reviews are never fully anonymous from their perspective.

---

#### How does the rating system work?

**Ratings use a 5-star scale:**

- ⭐ **1 star:** Very poor experience
- ⭐⭐ **2 stars:** Poor experience
- ⭐⭐⭐ **3 stars:** Average experience
- ⭐⭐⭐⭐ **4 stars:** Good experience
- ⭐⭐⭐⭐⭐ **5 stars:** Excellent experience

**Professional's average rating:**
- Calculated from all customer reviews
- Displayed on profile page and search results
- Updated in real-time when new reviews are submitted

**Tip:** Be honest but fair. Reviews help other customers make informed decisions.

---

#### Can professionals see who left reviews?

**Yes, professionals can see:**
- ✅ Your name (as shown on your profile)
- ✅ Your rating and review text
- ✅ When you left the review
- ✅ Which booking the review is associated with

**Professionals cannot see:**
- ❌ Your contact information (unless you shared it during booking)
- ❌ Your other reviews for different professionals
- ❌ Your private customer information

**This transparency encourages honest, respectful reviews on both sides.**

---

#### What if a professional asks me to change my review?

**You are not required to change your review.**

**If a professional contacts you about a review:**
- ✅ **Acceptable:** Professional politely explains their side or offers to resolve an issue
- ❌ **Unacceptable:** Professional pressures, threatens, or offers incentives to change review

**If you feel pressured:**
- Report the professional to support@casaora.co
- Include screenshots of messages
- We take review manipulation seriously

**Remember:** Reviews cannot be edited after posting, so stand by your honest assessment.

---

#### Can I review the same professional multiple times?

**Yes, you can leave multiple reviews for the same professional.**

**Scenarios:**
- You book them for different services (e.g., regular cleaning, then deep cleaning)
- You book them multiple times over several months
- Each review reflects a different booking experience

**Note:** Only reviews based on completed bookings are allowed. You cannot spam reviews.

---

#### What happens if I leave a negative review?

**Negative reviews are allowed and protected.**

**What happens:**
- Your review appears publicly on the professional's profile
- The professional may respond (future feature)
- Your review contributes to their average rating

**Our policy:**
- Honest negative reviews are valuable for the community
- Reviews must be truthful and based on actual experience
- Spam, profanity, or false claims will be removed

**Tips for constructive negative reviews:**
- Be specific about what went wrong
- Avoid personal attacks
- Suggest how the experience could have been better
- Focus on the service, not the person

---

### For Professionals

#### How do customer reviews affect my profile?

**Reviews are CRITICAL to your success on Casaora:**

**Impact on visibility:**
- Higher ratings (4.5+) rank higher in search results
- Reviews boost your profile credibility
- Detailed positive reviews increase booking conversions

**Impact on earnings:**
- Top-rated professionals (4.8+) charge 15-20% higher rates
- More reviews = more trust = more bookings
- Negative reviews can reduce booking requests by 30-50%

**Average impact:**
- 0 reviews: ~2% profile view → booking conversion
- 5+ reviews (4.5+ avg): ~8% conversion (4x increase!)
- 20+ reviews (4.8+ avg): ~12% conversion (6x increase!)

**Bottom line:** Encourage every satisfied customer to leave a review!

---

#### How do I ask customers to leave reviews?

**Best practices for requesting reviews:**

**1. Timing matters:**
- Ask immediately after completing the job (while experience is fresh)
- Send a follow-up message 24 hours later if no review submitted

**2. Make it easy:**
- Share your profile link via in-app messaging
- Example: "I'd appreciate it if you could leave a review at [your profile URL]. Thank you!"

**3. Be polite and professional:**
- ✅ "If you were happy with my service, I'd love a review!"
- ❌ "You MUST leave a 5-star review or I won't work with you again."

**4. Don't pressure or incentivize:**
- ❌ Offering discounts for 5-star reviews
- ❌ Threatening negative consequences for bad reviews
- ❌ Asking customers to remove/change negative reviews

**If we detect review manipulation, your account will be suspended.**

---

#### Can I review my customers?

**Yes! We have a two-way review system.**

**How it works:**
- After completing a booking, you can rate the customer
- Rate overall experience (1-5 stars)
- Optionally rate punctuality, communication, respectfulness
- Add optional title and comment

**Visibility:**
- 🔒 **Private** - Only you and the customer can see
- Not visible to other professionals or public
- Helps you track difficult customers

**When to use:**
- Customer was late or no-show
- Poor communication
- Disrespectful behavior
- Unsafe working conditions

**Where to submit:**
- Go to your professional dashboard
- Find "Pending Ratings" section
- Click "Rate Customer" for completed bookings

---

#### How can I improve my rating?

**1. Deliver excellent service (obviously!):**
- Be on time
- Communicate clearly
- Meet or exceed expectations
- Be professional and respectful

**2. Encourage reviews from satisfied customers:**
- Ask for reviews immediately after service
- Follow up politely if they don't leave one
- Make it easy (share your profile link)

**3. Respond to negative feedback constructively:**
- (Future feature) Apologize and explain what went wrong
- Show future customers you care about improvement

**4. Quantity matters too:**
- 1 bad review out of 50 reviews = 4.9 avg ✅
- 1 bad review out of 2 reviews = 3.0 avg ❌
- Get more reviews to dilute occasional negative ones

**5. Maintain consistency:**
- One-time excellence doesn't sustain high ratings
- Every booking is an opportunity to impress

**Target goals:**
- 10+ reviews: Shows you're active
- 4.5+ average: Minimum for competitive ranking
- 4.8+ average: Top-tier professional status

---

#### What if I receive an unfair negative review?

**Current options:**

1. **Contact support:** support@casaora.co
   - We review reports of false/malicious reviews
   - Provide evidence (messages, photos, receipts)
   - We'll remove reviews that violate terms

2. **Focus on getting more positive reviews:**
   - One negative review dilutes over time with more reviews
   - 1 bad review out of 50 total = minor impact

**What qualifies as removable:**
- ✅ Review based on false claims
- ✅ Review contains profanity or personal attacks
- ✅ Review is spam or from fake account
- ✅ Review violates our community guidelines

**What doesn't qualify:**
- ❌ Customer genuinely had a bad experience
- ❌ Customer is "too harsh" (subjective opinions allowed)
- ❌ Customer gave low rating without comment

**Future feature:**
- Public responses to reviews
- You'll be able to professionally explain your side

---

#### Do customer reviews expire or get deleted?

**No, reviews are permanent.**

**Why permanent reviews:**
- Builds long-term trust
- Prevents manipulation
- Shows your full history (good and bad)

**Exception:**
- Reviews may be removed if they violate terms
- Admin can remove spam/malicious content
- Customer account deletion removes their reviews

**Pro tip:** Think of reviews as your professional reputation. One bad review won't ruin you, but a pattern of negative reviews signals real issues to address.

---

#### Can I see my rating distribution?

**Yes! In your professional dashboard:**

1. Go to **Dashboard → Analytics**
2. View "Rating Distribution" section

**You'll see:**
- Average rating (e.g., 4.8 ⭐)
- Total review count
- Breakdown by stars (5★, 4★, 3★, 2★, 1★)
- Satisfaction rate (% of 4-5 star reviews)
- Monthly rating trends

**Use this data to:**
- Identify patterns in customer feedback
- Track improvement over time
- Celebrate milestones (e.g., 50 reviews at 4.9 avg!)

---

#### What's the difference between reviews I give and reviews I receive?

**Two separate review types:**

**A. Reviews you RECEIVE (from customers):**
- ✅ **Public** - Visible on your profile
- ✅ Affect your average rating
- ✅ Influence search ranking
- ✅ Critical for attracting new bookings

**B. Reviews you GIVE (to customers):**
- 🔒 **Private** - Only you and customer can see
- 🔒 Do NOT affect customer's public profile
- 🔒 Help you track problematic customers
- 🔒 Mutual accountability without public shaming

**Why the difference:**
- Customers are not service providers (no public reputation needed)
- Prevents customer harassment
- Maintains dignity while providing professional feedback

---

## 17. Troubleshooting Guide

### Review Submission Failed

**Symptoms:** Form submits but shows error message

**Common errors:**

**1. "You can only review professionals you've worked with"**
- **Cause:** You don't have a completed booking with this professional
- **Solution:** Complete a booking first, then review

**2. "You have already reviewed this professional"**
- **Cause:** Duplicate review (professional reviews only)
- **Solution:** You can only submit one professional review per account (wait for future update to allow multiple)

**3. "Please provide a review with at least 10 characters"**
- **Cause:** Comment too short
- **Solution:** Write a more detailed review

**4. "Authentication required"**
- **Cause:** You're not signed in
- **Solution:** Sign in and try again

---

### Review Not Appearing

**Symptoms:** Submitted review but don't see it on professional's profile

**Causes & Solutions:**

**1. Page not refreshed:**
- Hard refresh (Ctrl+R / Cmd+R)
- Clear browser cache

**2. Wrong professional profile:**
- Verify you're on the correct professional's page
- Check confirmation message for professional name

**3. Database issue:**
- Wait 5 minutes and refresh
- If still missing, contact support with booking ID

**4. Review was flagged:**
- Contains profanity or spam
- Admin removed due to policy violation
- Check email for notification

---

### Cannot Rate Customer

**Symptoms:** Professional cannot find option to rate customer

**Causes & Solutions:**

**1. Booking not completed yet:**
- Customer must complete booking first
- Status must be "completed"

**2. Already rated customer:**
- Check "Pending Ratings" list
- If not there, you've already submitted review
- Reviews can be updated (edit existing review)

**3. Wrong dashboard:**
- Make sure you're on Professional Dashboard (not Customer Dashboard)
- Look for "Pending Ratings" section

---

### Rating Not Updating

**Symptoms:** Left new review but professional's average rating unchanged

**Causes & Solutions:**

**1. Caching issue:**
- Rating calculated in real-time
- Refresh page to see updated average
- May take 1-2 minutes to propagate

**2. Decimal rounding:**
- If professional has many reviews, one new review may not change displayed average
- Example: 4.82 and 4.84 both display as "4.8"

**3. Database delay:**
- Supabase RLS may cache queries briefly
- Wait 5 minutes and check again

---

### Star Rating Not Clickable

**Symptoms:** Cannot click stars in rating form

**Causes & Solutions:**

**1. JavaScript disabled:**
- Enable JavaScript in browser settings
- Try different browser

**2. Browser extension blocking:**
- Disable ad blockers temporarily
- Try incognito/private mode

**3. Form submission in progress:**
- Wait for previous submission to complete
- Refresh page if stuck

**4. Mobile touch issue:**
- Try tapping stars individually (not swiping)
- Use landscape mode on mobile

---

### Professional Review Not Private

**Symptoms:** Professional worried customer reviews are public

**Clarification:**
- **Professional → Customer reviews are PRIVATE** ✅
- **Customer → Professional reviews are PUBLIC** ✅

**If you're seeing customer reviews publicly:**
- Those are reviews OF professionals (not reviews BY professionals)
- Your reviews OF customers are private (only you and customer can see)

---

### Review Count Mismatch

**Symptoms:** Professional says they have more reviews than displayed

**Causes:**

**1. Deleted customer accounts:**
- If customer deletes account, their reviews are removed
- Review count updates automatically

**2. Flagged/removed reviews:**
- Admin may remove spam or policy violations
- You won't be notified of removals

**3. Different review types:**
- Professional reviews (public) vs. customer reviews (private)
- Ensure you're looking at the right review type

---

### Cannot Submit Review for Old Booking

**Symptoms:** Completed booking months ago, cannot find review form

**Current limitation:**
- No time limit on review submissions
- Should work for any completed booking

**If not working:**
- Booking status may have changed (canceled, refunded)
- Contact support to verify booking status

---

## 18. Future Enhancements

### High Priority

**1. Review Editing (with time limit):**
- Allow customers to edit reviews within 24 hours
- Prevents permanent typos/mistakes
- Maintains integrity (no edits after 24h)

**2. Review Reporting & Moderation:**
- Flag inappropriate reviews
- Admin moderation queue
- Automated profanity filtering

**3. Professional Response to Reviews:**
- Professionals can publicly respond to reviews
- Shows accountability and customer service
- Standard for marketplace platforms

**4. Review Prompts/Reminders:**
- Automated email 24 hours after booking completion
- In-app push notifications
- Increases review submission rate

---

### Medium Priority

**5. Category Ratings for Professionals:**
- Similar to customer reviews (punctuality, quality, communication)
- More detailed feedback for customers

**6. Verified Booking Badge:**
- Visual indicator showing review is from verified booking
- Prevents confusion with fake reviews

**7. Review Photos:**
- Allow customers to upload before/after photos
- Visual proof of quality
- Increases trust significantly

**8. Helpful/Not Helpful Votes:**
- Community voting on review quality
- Surfacing most helpful reviews first

---

### Lower Priority

**9. Review Analytics Dashboard:**
- Detailed insights for professionals
- Sentiment analysis (AI-powered)
- Common keywords in reviews

**10. Review Templates:**
- Quick review options for busy customers
- "Great service, on time, would recommend!"
- Still allows custom text

**11. Review Rewards Program:**
- Incentivize review submissions (discount codes, loyalty points)
- Increase review volume

**12. Multi-Language Review Display:**
- Automatic translation of reviews
- Spanish customers see Spanish, English customers see English

---

## Files Reference

### Core Implementation

**Database:**
```
supabase/migrations-archive/
├── 20250102143000_extend_bookings_and_reviews.sql     # professional_reviews table
├── 20250102151000_create_customer_reviews_table.sql   # customer_reviews table
└── 20251101000005_fix_reviews_table_name.sql         # list_active_professionals RPC
```

**Server Actions:**
```
src/app/actions/
├── submit-professional-review.ts     # Customer rates professional
└── submit-customer-review.ts         # Professional rates customer
```

**Validation:**
```
src/lib/reviews/
└── review-validation-service.ts      # Validation helpers
```

**UI Components:**
```
src/components/
├── professionals/
│   └── professional-reviews.tsx      # Review list + form
├── reviews/
│   ├── rating-prompt-modal.tsx       # Professional rating UI
│   ├── pending-ratings-list.tsx      # Unreviewed bookings
│   └── star-rating.tsx               # Reusable star picker
└── analytics/
    └── rating-distribution.tsx       # Rating breakdown charts
```

**Admin:**
```
src/components/admin/
└── professional-review-modal.tsx     # Admin approves professionals

src/lib/admin/
└── professional-review-service.ts    # Admin review logic
```

**Types:**
```
src/types/
├── database.types.ts                 # Supabase generated types
└── components/professionals/types.ts # Review types
```

**API:**
```
src/app/api/admin/professionals/review/route.ts   # Admin review endpoint
```

---

**Last Updated:** 2025-11-06
**Status:** Production Ready
**Next Steps:** Implement review moderation + professional response system
