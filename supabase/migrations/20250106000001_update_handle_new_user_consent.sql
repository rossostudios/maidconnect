-- Update handle_new_user function to extract and store consent data from user metadata
-- This ensures consent timestamps are properly saved to the profiles table during registration

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Extract consent data from user metadata
  DECLARE
    v_consents JSONB;
    v_privacy_accepted BOOLEAN;
    v_privacy_timestamp TIMESTAMPTZ;
    v_terms_accepted BOOLEAN;
    v_terms_timestamp TIMESTAMPTZ;
    v_data_processing_accepted BOOLEAN;
    v_data_processing_timestamp TIMESTAMPTZ;
    v_marketing_accepted BOOLEAN;
    v_marketing_timestamp TIMESTAMPTZ;
  BEGIN
    -- Get consents object from raw_user_meta_data
    v_consents := NEW.raw_user_meta_data->'consents';

    -- Extract individual consent values
    v_privacy_accepted := COALESCE((v_consents->'privacy_policy'->>'accepted')::BOOLEAN, FALSE);
    v_privacy_timestamp := (v_consents->'privacy_policy'->>'timestamp')::TIMESTAMPTZ;

    v_terms_accepted := COALESCE((v_consents->'terms_of_service'->>'accepted')::BOOLEAN, FALSE);
    v_terms_timestamp := (v_consents->'terms_of_service'->>'timestamp')::TIMESTAMPTZ;

    v_data_processing_accepted := COALESCE((v_consents->'data_processing'->>'accepted')::BOOLEAN, FALSE);
    v_data_processing_timestamp := (v_consents->'data_processing'->>'timestamp')::TIMESTAMPTZ;

    v_marketing_accepted := COALESCE((v_consents->'marketing'->>'accepted')::BOOLEAN, FALSE);
    v_marketing_timestamp := (v_consents->'marketing'->>'timestamp')::TIMESTAMPTZ;

    -- Insert profile with consent data
    INSERT INTO public.profiles (
      id,
      role,
      locale,
      onboarding_status,
      privacy_policy_accepted,
      privacy_policy_accepted_at,
      terms_accepted,
      terms_accepted_at,
      data_processing_consent,
      data_processing_consent_at,
      marketing_consent,
      marketing_consent_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
      COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US'),
      CASE
        WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'professional'
        THEN 'application_pending'
        ELSE 'active'
      END,
      v_privacy_accepted,
      v_privacy_timestamp,
      v_terms_accepted,
      v_terms_timestamp,
      v_data_processing_accepted,
      v_data_processing_timestamp,
      v_marketing_accepted,
      v_marketing_timestamp
    );

    RETURN NEW;
  END;
END;
$$;

-- Comment explaining the updated function
COMMENT ON FUNCTION public.handle_new_user() IS
'Trigger function that creates a profile record when a new auth user is created. Extracts consent data from user metadata to comply with Ley 1581 de 2012.';
