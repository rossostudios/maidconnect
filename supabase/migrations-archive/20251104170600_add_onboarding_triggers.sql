-- Add trigger to auto-calculate onboarding completion percentage
-- Automatically updates can_accept_bookings flag when all required items are completed

CREATE OR REPLACE FUNCTION update_onboarding_completion()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INTEGER;
  required_count INTEGER;
  percentage INTEGER;
BEGIN
  -- Count completed required items
  SELECT COUNT(*) INTO completed_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true
    AND (item->>'completed')::boolean = true;

  -- Count total required items
  SELECT COUNT(*) INTO required_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true;

  -- Calculate percentage
  IF required_count > 0 THEN
    percentage := (completed_count * 100) / required_count;
  ELSE
    percentage := 0;
  END IF;

  -- Update fields
  NEW.onboarding_completion_percentage := percentage;
  NEW.can_accept_bookings := (percentage = 100);

  -- Update lastUpdated timestamp in JSONB
  NEW.onboarding_checklist := jsonb_set(
    NEW.onboarding_checklist,
    '{lastUpdated}',
    to_jsonb(NOW())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before insert/update on profiles
CREATE TRIGGER trigger_update_onboarding_completion
  BEFORE INSERT OR UPDATE OF onboarding_checklist ON profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'professional')
  EXECUTE FUNCTION update_onboarding_completion();

-- Helper function to mark a checklist item as completed
CREATE OR REPLACE FUNCTION mark_onboarding_item_completed(
  professional_profile_id UUID,
  item_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  updated_checklist JSONB;
  item_index INTEGER;
BEGIN
  -- Find the index of the item in the array
  SELECT ordinality - 1 INTO item_index
  FROM jsonb_array_elements(
    (SELECT onboarding_checklist->'items' FROM profiles WHERE id = professional_profile_id)
  ) WITH ORDINALITY arr(item, ordinality)
  WHERE item->>'id' = item_id;

  IF item_index IS NULL THEN
    RAISE EXCEPTION 'Onboarding item % not found', item_id;
  END IF;

  -- Update the specific item's completed status
  UPDATE profiles
  SET onboarding_checklist = jsonb_set(
    onboarding_checklist,
    array['items', item_index::text, 'completed'],
    'true'::jsonb
  )
  WHERE id = professional_profile_id
  RETURNING onboarding_checklist INTO updated_checklist;

  RETURN updated_checklist;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get onboarding progress
CREATE OR REPLACE FUNCTION get_onboarding_progress(professional_profile_id UUID)
RETURNS TABLE(
  completion_percentage INTEGER,
  can_accept_bookings BOOLEAN,
  completed_items JSONB,
  pending_required_items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.onboarding_completion_percentage,
    p.can_accept_bookings,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'completed')::boolean = true
    ) AS completed_items,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'required')::boolean = true
        AND (item->>'completed')::boolean = false
    ) AS pending_required_items
  FROM profiles p
  WHERE p.id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_onboarding_completion IS 'Auto-calculates completion % and sets can_accept_bookings flag';
COMMENT ON FUNCTION mark_onboarding_item_completed IS 'Marks a specific onboarding checklist item as completed';
COMMENT ON FUNCTION get_onboarding_progress IS 'Returns detailed onboarding progress for a professional';
