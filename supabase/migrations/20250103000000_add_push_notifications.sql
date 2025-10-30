-- Add push notification subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Add RLS policies
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON notification_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON notification_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON notification_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON notification_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_notification_subscriptions_user_id
  ON notification_subscriptions(user_id);

-- Add notification preferences to user profiles
ALTER TABLE customer_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "bookingConfirmed": true,
    "bookingAccepted": true,
    "bookingDeclined": true,
    "serviceStarted": true,
    "serviceCompleted": true,
    "newMessage": true,
    "reviewReminder": true
  }'::jsonb;

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "newBookingRequest": true,
    "bookingCanceled": true,
    "paymentReceived": true,
    "newMessage": true,
    "reviewReceived": true
  }'::jsonb;

-- Add updated_at trigger for notification_subscriptions
CREATE OR REPLACE FUNCTION update_notification_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_subscriptions_updated_at
  BEFORE UPDATE ON notification_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_subscriptions_updated_at();
