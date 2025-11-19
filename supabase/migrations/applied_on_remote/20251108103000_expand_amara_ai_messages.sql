-- ============================================================================
-- Migration: Expand Amara AI message storage + tool telemetry
-- Description:
--   * Add structured parts/attachments/status tracking to amara_messages
--   * Create amara_tool_runs table for detailed tool execution logs
--   * Provision private storage bucket for Amara attachments
-- ============================================================================

-- 1. Extend amara_messages with structured parts/attachments/status
ALTER TABLE public.amara_messages
  ADD COLUMN IF NOT EXISTS parts jsonb;

ALTER TABLE public.amara_messages
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.amara_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';

ALTER TABLE public.amara_messages
  ALTER COLUMN parts SET DEFAULT '[]'::jsonb;

-- Normalize existing rows
UPDATE public.amara_messages
SET
  parts = COALESCE(
    NULLIF(parts, 'null'::jsonb),
    CASE
      WHEN content IS NULL OR content = '' THEN '[]'::jsonb
      ELSE jsonb_build_array(jsonb_build_object('type', 'text', 'text', content))
    END
  ),
  attachments = COALESCE(attachments, '[]'::jsonb),
  status = COALESCE(NULLIF(status, ''), 'completed');

-- Constrain status values
ALTER TABLE public.amara_messages
  ADD CONSTRAINT amara_messages_status_check
  CHECK (status = ANY (ARRAY['submitted', 'streaming', 'completed', 'error']));

CREATE INDEX IF NOT EXISTS idx_amara_messages_conversation_created
  ON public.amara_messages (conversation_id, created_at DESC);

-- 2. Create amara_tool_runs table for telemetry
CREATE TABLE IF NOT EXISTS public.amara_tool_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.amara_conversations(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.amara_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_call_id text NOT NULL,
  tool_name text NOT NULL,
  state text NOT NULL DEFAULT 'output-available',
  input jsonb,
  output jsonb,
  error_text text,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT amara_tool_runs_state_check CHECK (
    state = ANY (
      ARRAY[
        'input-streaming',
        'input-available',
        'approval-requested',
        'approval-responded',
        'output-available',
        'output-error',
        'output-denied'
      ]
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_amara_tool_runs_conversation
  ON public.amara_tool_runs (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_amara_tool_runs_user
  ON public.amara_tool_runs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_amara_tool_runs_name
  ON public.amara_tool_runs (tool_name);

ALTER TABLE public.amara_tool_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their Amara tool runs"
  ON public.amara_tool_runs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert their Amara tool runs"
  ON public.amara_tool_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Private storage bucket for Amara attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('amara-attachments', 'amara-attachments', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Amara attachments select'
  ) THEN
    CREATE POLICY "Amara attachments select"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'amara-attachments' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Amara attachments insert'
  ) THEN
    CREATE POLICY "Amara attachments insert"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'amara-attachments' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Amara attachments delete'
  ) THEN
    CREATE POLICY "Amara attachments delete"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'amara-attachments' AND owner = auth.uid());
  END IF;
END
$$;

COMMENT ON TABLE public.amara_tool_runs IS 'Detailed log of Amara tool executions (input/output/error metadata).';
COMMENT ON COLUMN public.amara_messages.parts IS 'Structured UI parts (text, files, tool results) for each chat message.';
COMMENT ON COLUMN public.amara_messages.attachments IS 'Subset of parts that represent user-uploaded files.';
