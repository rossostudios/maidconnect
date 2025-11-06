// Professional queue helpers - Extract data processing logic

export type ProfessionalDocument = {
  profile_id: string;
  document_type: string;
  status: string;
  uploaded_at: string;
  metadata: unknown;
};

export type ProfessionalReview = {
  id: string;
  professional_id: string;
  review_type: string;
  status: string;
  documents_verified: boolean | null;
  background_check_passed: boolean | null;
  references_verified: boolean | null;
  notes: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type ProfessionalData = {
  profile_id: string;
  created_at: string;
  profile?: {
    onboarding_status: string;
  };
  [key: string]: unknown;
};

/**
 * Group documents by professional ID
 */
export function groupDocumentsByProfessional(
  documents: ProfessionalDocument[] | null
): Map<string, ProfessionalDocument[]> {
  const documentsMap = new Map<string, ProfessionalDocument[]>();

  for (const doc of documents || []) {
    if (!documentsMap.has(doc.profile_id)) {
      documentsMap.set(doc.profile_id, []);
    }
    documentsMap.get(doc.profile_id)!.push(doc);
  }

  return documentsMap;
}

/**
 * Group reviews by professional ID
 */
export function groupReviewsByProfessional(
  reviews: ProfessionalReview[] | null
): Map<string, ProfessionalReview[]> {
  const reviewsMap = new Map<string, ProfessionalReview[]>();

  for (const review of reviews || []) {
    if (!reviewsMap.has(review.professional_id)) {
      reviewsMap.set(review.professional_id, []);
    }
    reviewsMap.get(review.professional_id)!.push(review);
  }

  return reviewsMap;
}

/**
 * Enrich professional data with documents and reviews
 */
export function enrichProfessionalData(
  professionals: ProfessionalData[],
  documentsMap: Map<string, ProfessionalDocument[]>,
  reviewsMap: Map<string, ProfessionalReview[]>
) {
  return professionals.map((prof) => {
    const documents = documentsMap.get(prof.profile_id) || [];
    const reviews = reviewsMap.get(prof.profile_id) || [];

    return {
      ...prof,
      documents,
      reviews,
      email: null, // We don't have access to auth.users.email in this query
      documentsCount: documents.length,
      latestReview: reviews[0] || null,
      waitingDays: Math.floor(
        (Date.now() - new Date(prof.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  });
}

/**
 * Group professionals by onboarding status
 */
export function groupProfessionalsByStatus(professionals: ProfessionalData[]) {
  return {
    application_in_review: professionals.filter(
      (p) => p.profile?.onboarding_status === "application_in_review"
    ),
    approved: professionals.filter((p) => p.profile?.onboarding_status === "approved"),
    application_pending: professionals.filter(
      (p) => p.profile?.onboarding_status === "application_pending"
    ),
  };
}
