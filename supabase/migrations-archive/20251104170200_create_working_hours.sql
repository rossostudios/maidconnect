-- Create professional_working_hours table for calendar health tracking
-- Supports different hours for each day of the week

CREATE TABLE IF NOT EXISTS professional_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  is_available BOOLEAN DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no overlapping time slots for same day
  CONSTRAINT unique_profile_day UNIQUE (profile_id, day_of_week),

  -- Ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_working_hours_profile
ON professional_working_hours (profile_id);

CREATE INDEX IF NOT EXISTS idx_working_hours_day
ON professional_working_hours (day_of_week);

CREATE INDEX IF NOT EXISTS idx_working_hours_available
ON professional_working_hours (profile_id, is_available)
WHERE is_available = true;

-- Enable RLS
ALTER TABLE professional_working_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view working hours"
  ON professional_working_hours
  FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their own working hours"
  ON professional_working_hours
  FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE professional_working_hours IS 'Weekly working hours for professionals to define availability windows';
COMMENT ON COLUMN professional_working_hours.day_of_week IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday';
