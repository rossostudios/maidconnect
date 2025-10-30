-- ============================================================================
-- PROFESSIONAL PORTFOLIO GALLERY
-- Sprint 4 Phase 2 - Allow professionals to showcase their work
-- ============================================================================

-- Add portfolio images to professional profiles
alter table public.professional_profiles
  add column if not exists portfolio_images jsonb default '[]'::jsonb,
  add column if not exists featured_work text; -- Optional text description of featured work

-- Portfolio image structure (stored as JSONB array):
-- [
--   {
--     "id": "uuid",
--     "url": "https://...",
--     "thumbnail_url": "https://...",
--     "caption": "Before and after kitchen deep clean",
--     "order": 0,
--     "created_at": "2025-10-29T..."
--   }
-- ]

comment on column public.professional_profiles.portfolio_images is 'Array of portfolio images showcasing professional work';
comment on column public.professional_profiles.featured_work is 'Text description of featured work or specialties';

-- Create index for faster queries
create index if not exists idx_professional_portfolio on public.professional_profiles using gin(portfolio_images);

-- Grant permissions
grant select on public.professional_profiles to anon, authenticated;
grant update(portfolio_images, featured_work) on public.professional_profiles to authenticated;
