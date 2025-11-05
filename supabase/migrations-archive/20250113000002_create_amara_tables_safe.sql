-- =============================================
-- Amara AI Chat System Database Schema (Safe)
-- =============================================
-- Description: Creates tables for Amara AI assistant conversations and messages
-- This version safely handles existing objects by dropping and recreating
-- Created: 2025-01-13
-- =============================================

-- Create amara_conversations table
CREATE TABLE IF NOT EXISTS public.amara_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create amara_messages table
CREATE TABLE IF NOT EXISTS public.amara_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.amara_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Drop existing indexes if they exist
-- =============================================

DROP INDEX IF EXISTS public.idx_amara_conversations_user_id;
DROP INDEX IF EXISTS public.idx_amara_conversations_active;
DROP INDEX IF EXISTS public.idx_amara_conversations_last_message;
DROP INDEX IF EXISTS public.idx_amara_messages_conversation_id;
DROP INDEX IF EXISTS public.idx_amara_messages_created_at;
DROP INDEX IF EXISTS public.idx_amara_messages_role;

-- =============================================
-- Create indexes
-- =============================================

-- Performance indexes for amara_conversations
CREATE INDEX idx_amara_conversations_user_id ON public.amara_conversations(user_id);
CREATE INDEX idx_amara_conversations_active ON public.amara_conversations(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_amara_conversations_last_message ON public.amara_conversations(user_id, last_message_at DESC);

-- Performance indexes for amara_messages
CREATE INDEX idx_amara_messages_conversation_id ON public.amara_messages(conversation_id);
CREATE INDEX idx_amara_messages_created_at ON public.amara_messages(conversation_id, created_at ASC);
CREATE INDEX idx_amara_messages_role ON public.amara_messages(role);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.amara_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amara_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Drop and recreate RLS Policies for amara_conversations
-- =============================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.amara_conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.amara_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.amara_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.amara_conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.amara_conversations;

CREATE POLICY "Users can view own conversations"
  ON public.amara_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
  ON public.amara_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON public.amara_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON public.amara_conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all conversations"
  ON public.amara_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- Drop and recreate RLS Policies for amara_messages
-- =============================================

DROP POLICY IF EXISTS "Users can view own conversation messages" ON public.amara_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.amara_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.amara_messages;

CREATE POLICY "Users can view own conversation messages"
  ON public.amara_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.amara_conversations
      WHERE amara_conversations.id = amara_messages.conversation_id
      AND amara_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.amara_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.amara_conversations
      WHERE amara_conversations.id = amara_messages.conversation_id
      AND amara_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages"
  ON public.amara_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- Functions and Triggers
-- =============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS set_amara_conversations_updated_at ON public.amara_conversations;
DROP TRIGGER IF EXISTS set_conversation_last_message_at ON public.amara_messages;

-- Drop and recreate functions
DROP FUNCTION IF EXISTS update_amara_conversations_updated_at();
DROP FUNCTION IF EXISTS update_conversation_last_message_at();

-- Function to automatically update updated_at timestamp
CREATE FUNCTION update_amara_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER set_amara_conversations_updated_at
  BEFORE UPDATE ON public.amara_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_amara_conversations_updated_at();

-- Function to update conversation's last_message_at
CREATE FUNCTION update_conversation_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.amara_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at
CREATE TRIGGER set_conversation_last_message_at
  AFTER INSERT ON public.amara_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message_at();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.amara_conversations IS 'Stores Amara AI assistant chat conversations for users';
COMMENT ON TABLE public.amara_messages IS 'Stores individual messages within Amara conversations';

COMMENT ON COLUMN public.amara_conversations.user_id IS 'Reference to the user who owns this conversation';
COMMENT ON COLUMN public.amara_conversations.title IS 'Optional conversation title, auto-generated from first message';
COMMENT ON COLUMN public.amara_conversations.locale IS 'User''s preferred language for this conversation (en or es)';
COMMENT ON COLUMN public.amara_conversations.metadata IS 'Additional context like user location, search filters, etc.';

COMMENT ON COLUMN public.amara_messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN public.amara_messages.tool_calls IS 'JSONB array of AI tool invocations from Vercel AI SDK';
COMMENT ON COLUMN public.amara_messages.tool_results IS 'JSONB array of tool execution results';
COMMENT ON COLUMN public.amara_messages.metadata IS 'Additional data like model used, token count, processing time';
