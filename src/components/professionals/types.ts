export type ProfessionalBookingSummary = {
  id: string;
  status: string;
  scheduledStart: string | null;
  durationMinutes: number | null;
  amountEstimated: number | null;
  amountAuthorized: number | null;
  amountCaptured: number | null;
  currency: string | null;
  serviceName: string | null;
};

export type ProfessionalReviewSummary = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
};

export type ProfessionalPortfolioImage = {
  url: string;
  caption: string | null;
};
