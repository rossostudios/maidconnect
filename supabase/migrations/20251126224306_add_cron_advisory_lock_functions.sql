-- Add PostgreSQL advisory lock helper functions for cron job concurrency control
-- SECURITY: Prevents concurrent cron job execution (race conditions)

-- Function to acquire a named lock (non-blocking)
-- Returns true if lock acquired, false if already held by another session
CREATE OR REPLACE FUNCTION public.try_acquire_cron_lock(lock_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lock_id BIGINT;
BEGIN
  -- Generate a consistent lock ID from the lock name using hashtext
  lock_id := hashtext(lock_name);

  -- Try to acquire the advisory lock (non-blocking)
  -- pg_try_advisory_lock returns true if lock acquired, false otherwise
  RETURN pg_try_advisory_lock(lock_id);
END;
$$;

-- Function to release a named lock
CREATE OR REPLACE FUNCTION public.release_cron_lock(lock_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lock_id BIGINT;
BEGIN
  lock_id := hashtext(lock_name);

  -- Release the advisory lock
  PERFORM pg_advisory_unlock(lock_id);
END;
$$;

-- Grant execute permissions to authenticated users (for service role)
GRANT EXECUTE ON FUNCTION public.try_acquire_cron_lock(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_cron_lock(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.try_acquire_cron_lock(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_cron_lock(TEXT) TO service_role;

COMMENT ON FUNCTION public.try_acquire_cron_lock IS 'Acquires a named advisory lock for cron job concurrency control. Returns true if acquired, false if held by another session.';
COMMENT ON FUNCTION public.release_cron_lock IS 'Releases a named advisory lock acquired by try_acquire_cron_lock.';
