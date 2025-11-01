-- =============================================
-- Add UPDATE policy for etta_messages (for feedback)
-- =============================================
-- Description: Allows users to update messages in their own conversations
-- This is needed for the feedback feature (thumbs up/down)
-- Created: 2025-11-01
-- =============================================

-- Add UPDATE policy for etta_messages to allow feedback
CREATE POLICY "Users can update messages in own conversations"
  ON public.etta_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.etta_conversations
      WHERE etta_conversations.id = etta_messages.conversation_id
      AND etta_conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.etta_conversations
      WHERE etta_conversations.id = etta_messages.conversation_id
      AND etta_conversations.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can update messages in own conversations" ON public.etta_messages IS
  'Allows users to update message metadata (e.g., feedback) in their own conversations';
