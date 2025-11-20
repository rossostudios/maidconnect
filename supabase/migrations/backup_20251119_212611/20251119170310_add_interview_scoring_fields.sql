-- Migration: Add interview scoring fields to admin_professional_reviews table
-- Created: 2025-01-17
-- Description: Adds fields for storing interview ratings, scores, and recommendations

-- Add interview scoring columns to admin_professional_reviews table
ALTER TABLE admin_professional_reviews
  ADD COLUMN IF NOT EXISTS interview_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS interview_average_score DECIMAL(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recommendation TEXT CHECK (recommendation IN ('approve', 'reject', 'second_interview')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS interviewer_name TEXT DEFAULT NULL;

-- Add comment to document the interview_scores structure
COMMENT ON COLUMN admin_professional_reviews.interview_scores IS
  'JSON object containing interview ratings: { professionalism: 1-5, communication: 1-5, technical_knowledge: 1-5, customer_service: 1-5 }';

COMMENT ON COLUMN admin_professional_reviews.interview_average_score IS
  'Average of all interview ratings (1.00 to 5.00)';

COMMENT ON COLUMN admin_professional_reviews.recommendation IS
  'Interview outcome recommendation: approve, reject, or second_interview';

COMMENT ON COLUMN admin_professional_reviews.interviewer_name IS
  'Name of the person who conducted the interview';

-- Create index on recommendation for faster filtering
CREATE INDEX IF NOT EXISTS idx_professional_reviews_recommendation
  ON admin_professional_reviews(recommendation)
  WHERE recommendation IS NOT NULL;

-- Create index on interview_average_score for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_professional_reviews_avg_score
  ON admin_professional_reviews(interview_average_score)
  WHERE interview_average_score IS NOT NULL;
