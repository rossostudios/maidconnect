-- =============================================
-- Etta AI Chat System Database Schema
-- =============================================
-- Description: Creates tables for Etta AI assistant conversations and messages
-- Created: 2025-01-13
-- =============================================

-- Create etta_conversations table
CREATE TABLE IF NOT EXISTS public.etta_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation metadata
  title TEXT, -- Optional conversation title (auto-generated from first message)
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'es')),

  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,

  -- Metadata (for analytics, user context, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create etta_messages table
CREATE TABLE IF NOT EXISTS public.etta_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversation reference
  conversation_id UUID NOT NULL REFERENCES public.etta_conversations(id) ON DELETE CASCADE,

  -- Message details
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- AI tool calls and results (for Vercel AI SDK)
  tool_calls JSONB, -- Stores tool invocations
  tool_results JSONB, -- Stores tool execution results

  -- Metadata (model used, tokens, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Performance indexes for etta_conversations
CREATE INDEX idx_etta_conversations_user_id ON public.etta_conversations(user_id);
CREATE INDEX idx_etta_conversations_active ON public.etta_conversations(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_etta_conversations_last_message ON public.etta_conversations(user_id, last_message_at DESC);

-- Performance indexes for etta_messages
CREATE INDEX idx_etta_messages_conversation_id ON public.etta_messages(conversation_id);
CREATE INDEX idx_etta_messages_created_at ON public.etta_messages(conversation_id, created_at ASC);
CREATE INDEX idx_etta_messages_role ON public.etta_messages(role);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.etta_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etta_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for etta_conversations
-- =============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.etta_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations"
  ON public.etta_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.etta_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON public.etta_conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON public.etta_conversations
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
-- RLS Policies for etta_messages
-- =============================================

-- Users can view messages from their own conversations
CREATE POLICY "Users can view own conversation messages"
  ON public.etta_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.etta_conversations
      WHERE etta_conversations.id = etta_messages.conversation_id
      AND etta_conversations.user_id = auth.uid()
    )
  );

-- Users can create messages in their own conversations
CREATE POLICY "Users can create messages in own conversations"
  ON public.etta_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.etta_conversations
      WHERE etta_conversations.id = etta_messages.conversation_id
      AND etta_conversations.user_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.etta_messages
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

-- Function to automatically update updated_at timestamp for etta_conversations
CREATE OR REPLACE FUNCTION update_etta_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for etta_conversations updated_at
CREATE TRIGGER set_etta_conversations_updated_at
  BEFORE UPDATE ON public.etta_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_etta_conversations_updated_at();

-- Function to update conversation's last_message_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.etta_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at on new messages
CREATE TRIGGER set_conversation_last_message_at
  AFTER INSERT ON public.etta_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message_at();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.etta_conversations IS 'Stores Etta AI assistant chat conversations for users';
COMMENT ON TABLE public.etta_messages IS 'Stores individual messages within Etta conversations';

COMMENT ON COLUMN public.etta_conversations.user_id IS 'Reference to the user who owns this conversation';
COMMENT ON COLUMN public.etta_conversations.title IS 'Optional conversation title, auto-generated from first message';
COMMENT ON COLUMN public.etta_conversations.locale IS 'User''s preferred language for this conversation (en or es)';
COMMENT ON COLUMN public.etta_conversations.metadata IS 'Additional context like user location, search filters, etc.';

COMMENT ON COLUMN public.etta_messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN public.etta_messages.tool_calls IS 'JSONB array of AI tool invocations from Vercel AI SDK';
COMMENT ON COLUMN public.etta_messages.tool_results IS 'JSONB array of tool execution results';
COMMENT ON COLUMN public.etta_messages.metadata IS 'Additional data like model used, token count, processing time';
