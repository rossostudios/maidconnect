-- Create briefs table for client intake requests
-- Supports both brief intake forms and concierge service requests

-- Drop table if exists (for development)
DROP TABLE IF EXISTS public.briefs CASCADE;

-- Create briefs table
CREATE TABLE public.briefs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service details
  service_type TEXT NOT NULL CHECK (service_type IN (
    'housekeeping',
    'childcare',
    'eldercare',
    'cooking',
    'estate_management',
    'other'
  )),

  -- Location and preferences
  city TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('english', 'spanish', 'both')),
  start_date TEXT NOT NULL,
  hours_per_week TEXT NOT NULL,

  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Additional details
  requirements TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'matched',
    'completed',
    'cancelled'
  )),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Add indexes for common queries
CREATE INDEX idx_briefs_status ON public.briefs(status);
CREATE INDEX idx_briefs_email ON public.briefs(email);
CREATE INDEX idx_briefs_created_at ON public.briefs(created_at DESC);
CREATE INDEX idx_briefs_city ON public.briefs(city);
CREATE INDEX idx_briefs_service_type ON public.briefs(service_type);

-- Add metadata index for JSONB queries
CREATE INDEX idx_briefs_metadata ON public.briefs USING GIN (metadata);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_briefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_briefs_updated_at
  BEFORE UPDATE ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_briefs_updated_at();

-- Enable Row Level Security
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to briefs"
  ON public.briefs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own briefs
CREATE POLICY "Users can view their own briefs"
  ON public.briefs
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Allow authenticated users to insert their own briefs
CREATE POLICY "Users can create their own briefs"
  ON public.briefs
  FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.jwt()->>'email');

-- Allow admins to view all briefs
CREATE POLICY "Admins can view all briefs"
  ON public.briefs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update briefs
CREATE POLICY "Admins can update briefs"
  ON public.briefs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.briefs TO authenticated;
GRANT ALL ON public.briefs TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.briefs IS 'Client intake requests for both brief forms and concierge services. Use metadata.type to differentiate between "brief" and "concierge" requests.';
COMMENT ON COLUMN public.briefs.metadata IS 'Store additional data like { "type": "brief" | "concierge", "source": "web" | "mobile", etc. }';
