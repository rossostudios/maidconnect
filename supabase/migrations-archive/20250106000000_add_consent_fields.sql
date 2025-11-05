-- Add consent tracking fields to profiles table for Ley 1581 de 2012 compliance
-- This migration adds fields to store user consent for privacy policy, terms of service,
-- data processing, and marketing communications as required by Colombian data protection law

-- Add consent columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_processing_consent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;

-- Add index for querying users who have given marketing consent
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent
ON public.profiles(marketing_consent)
WHERE marketing_consent = TRUE;

-- Add comment explaining the consent fields
COMMENT ON COLUMN public.profiles.privacy_policy_accepted IS
'User has accepted the Privacy Policy (required for registration)';

COMMENT ON COLUMN public.profiles.privacy_policy_accepted_at IS
'Timestamp when Privacy Policy was accepted (ISO 8601)';

COMMENT ON COLUMN public.profiles.terms_accepted IS
'User has accepted the Terms of Service (required for registration)';

COMMENT ON COLUMN public.profiles.terms_accepted_at IS
'Timestamp when Terms of Service were accepted (ISO 8601)';

COMMENT ON COLUMN public.profiles.data_processing_consent IS
'User has consented to data processing including third-party transfers (required by Ley 1581 de 2012)';

COMMENT ON COLUMN public.profiles.data_processing_consent_at IS
'Timestamp when data processing consent was given (ISO 8601)';

COMMENT ON COLUMN public.profiles.marketing_consent IS
'User has opted in to receive marketing communications (optional)';

COMMENT ON COLUMN public.profiles.marketing_consent_at IS
'Timestamp when marketing consent was given or withdrawn (ISO 8601)';

-- Create a function to update consent
CREATE OR REPLACE FUNCTION public.update_user_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_accepted BOOLEAN
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate consent type
  IF p_consent_type NOT IN ('privacy_policy', 'terms', 'data_processing', 'marketing') THEN
    RAISE EXCEPTION 'Invalid consent type: %', p_consent_type;
  END IF;

  -- Update the appropriate consent field
  CASE p_consent_type
    WHEN 'privacy_policy' THEN
      UPDATE public.profiles
      SET
        privacy_policy_accepted = p_accepted,
        privacy_policy_accepted_at = CASE WHEN p_accepted THEN NOW() ELSE privacy_policy_accepted_at END
      WHERE id = p_user_id;

    WHEN 'terms' THEN
      UPDATE public.profiles
      SET
        terms_accepted = p_accepted,
        terms_accepted_at = CASE WHEN p_accepted THEN NOW() ELSE terms_accepted_at END
      WHERE id = p_user_id;

    WHEN 'data_processing' THEN
      UPDATE public.profiles
      SET
        data_processing_consent = p_accepted,
        data_processing_consent_at = CASE WHEN p_accepted THEN NOW() ELSE data_processing_consent_at END
      WHERE id = p_user_id;

    WHEN 'marketing' THEN
      UPDATE public.profiles
      SET
        marketing_consent = p_accepted,
        marketing_consent_at = NOW()
      WHERE id = p_user_id;
  END CASE;
END;
$$;

-- Grant execute permission on the consent update function
GRANT EXECUTE ON FUNCTION public.update_user_consent(UUID, TEXT, BOOLEAN) TO authenticated;

-- Add RLS policy to allow users to view their own consent status
CREATE POLICY "Users can view their own consent status" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add RLS policy to allow users to update their own profile
-- Note: Application logic should prevent changing required consents after registration
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a trigger to prevent changing required consents after they've been set
CREATE OR REPLACE FUNCTION public.protect_required_consents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Once privacy_policy_accepted is TRUE, it cannot be changed back to FALSE
  IF OLD.privacy_policy_accepted = TRUE AND NEW.privacy_policy_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke privacy policy consent after it has been accepted';
  END IF;

  -- Once terms_accepted is TRUE, it cannot be changed back to FALSE
  IF OLD.terms_accepted = TRUE AND NEW.terms_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke terms of service consent after it has been accepted';
  END IF;

  -- Once data_processing_consent is TRUE, it cannot be changed back to FALSE
  IF OLD.data_processing_consent = TRUE AND NEW.data_processing_consent = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke data processing consent after it has been accepted';
  END IF;

  -- Marketing consent can be changed freely (GDPR/Ley 1581 requirement)
  RETURN NEW;
END;
$$;

-- Create trigger to protect required consents
DROP TRIGGER IF EXISTS protect_required_consents_trigger ON public.profiles;
CREATE TRIGGER protect_required_consents_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_required_consents();
