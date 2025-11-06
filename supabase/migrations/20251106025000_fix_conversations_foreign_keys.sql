-- Migration: Fix conversations and messages foreign keys
-- Description: Correct foreign key references to use profiles and professional_profiles tables
-- Author: Claude Code
-- Date: 2025-11-06

-- Drop existing tables if they were created with wrong schema
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- ============================================================================
-- CONVERSATIONS TABLE (CORRECTED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(profile_id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  customer_unread_count INTEGER DEFAULT 0,
  professional_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for conversations
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_booking ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_professional ON public.conversations(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- ============================================================================
-- MESSAGES TABLE (CORRECTED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id) WHERE read_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations SELECT policy
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (
    customer_id = auth.uid() OR professional_id = auth.uid()
  );

-- Conversations INSERT policy
DROP POLICY IF EXISTS "Users can create conversations for their bookings" ON public.conversations;
CREATE POLICY "Users can create conversations for their bookings"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() OR professional_id = auth.uid()
  );

-- Conversations UPDATE policy
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  USING (
    customer_id = auth.uid() OR professional_id = auth.uid()
  );

-- Messages SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

-- Messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

-- Messages UPDATE policy (for marking as read)
DROP POLICY IF EXISTS "Users can update messages to mark as read" ON public.messages;
CREATE POLICY "Users can update messages to mark as read"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update conversation timestamp and unread counts
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_customer_id UUID;
  conv_professional_id UUID;
BEGIN
  -- Get conversation participants
  SELECT customer_id, professional_id
  INTO conv_customer_id, conv_professional_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  -- Update conversation timestamp and increment unread count for recipient
  IF NEW.sender_id = conv_customer_id THEN
    -- Customer sent message, increment professional unread count
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      professional_unread_count = professional_unread_count + 1,
      updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSE
    -- Professional sent message, increment customer unread count
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      customer_unread_count = customer_unread_count + 1,
      updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for new messages
DROP TRIGGER IF EXISTS trigger_new_message ON public.messages;
CREATE TRIGGER trigger_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- Function to handle message read status
CREATE OR REPLACE FUNCTION public.handle_message_read()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_customer_id UUID;
  conv_professional_id UUID;
  remaining_unread INTEGER;
BEGIN
  -- Only proceed if read_at was just set
  IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
    -- Get conversation participants
    SELECT customer_id, professional_id
    INTO conv_customer_id, conv_professional_id
    FROM public.conversations
    WHERE id = NEW.conversation_id;

    -- Determine who read the message and reset their unread count
    IF auth.uid() = conv_customer_id THEN
      -- Customer read message, recalculate customer unread count
      SELECT COUNT(*)
      INTO remaining_unread
      FROM public.messages
      WHERE conversation_id = NEW.conversation_id
      AND sender_id = conv_professional_id
      AND read_at IS NULL;

      UPDATE public.conversations
      SET customer_unread_count = remaining_unread
      WHERE id = NEW.conversation_id;
    ELSE
      -- Professional read message, recalculate professional unread count
      SELECT COUNT(*)
      INTO remaining_unread
      FROM public.messages
      WHERE conversation_id = NEW.conversation_id
      AND sender_id = conv_customer_id
      AND read_at IS NULL;

      UPDATE public.conversations
      SET professional_unread_count = remaining_unread
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for message read status
DROP TRIGGER IF EXISTS trigger_message_read ON public.messages;
CREATE TRIGGER trigger_message_read
  AFTER UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_read();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.conversations IS 'Conversations between customers and professionals for bookings';
COMMENT ON TABLE public.messages IS 'Messages within conversations';
COMMENT ON COLUMN public.conversations.booking_id IS 'Reference to the booking this conversation is about';
COMMENT ON COLUMN public.conversations.customer_id IS 'Reference to the customer profile';
COMMENT ON COLUMN public.conversations.professional_id IS 'Reference to the professional profile';
COMMENT ON COLUMN public.conversations.customer_unread_count IS 'Number of unread messages for the customer';
COMMENT ON COLUMN public.conversations.professional_unread_count IS 'Number of unread messages for the professional';
COMMENT ON COLUMN public.messages.sender_id IS 'Profile ID of the message sender';
COMMENT ON COLUMN public.messages.read_at IS 'Timestamp when message was marked as read by recipient';
