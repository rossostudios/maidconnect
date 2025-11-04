export type Review = {
  id: string;
  bookingId: string;
  professionalId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  professionalName?: string;
  customerName?: string;
};

export type ReviewRecord = {
  id: string;
  booking_id: string;
  professional_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type CreateReviewParams = {
  bookingId: string;
  rating: number;
  comment?: string;
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
};
