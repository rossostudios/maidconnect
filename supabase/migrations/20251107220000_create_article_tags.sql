-- ============================================================================
-- Migration: Create article tags system
-- Description: Enable article categorization with tags for better discoverability
-- Author: Help Center Improvements Sprint 2
-- Date: 2025-11-07
-- ============================================================================

-- CRITICAL: This migration enables article tagging to:
--   1. Improve content discoverability through tag-based filtering
--   2. Group related articles by topics (payment, verification, mobile, etc.)
--   3. Enhance SEO with structured metadata
--   4. Support tag-based search and navigation
--
-- Key features:
--   - Bilingual tags (EN/ES) for internationalization
--   - Color coding for visual categorization
--   - Many-to-many relationship (articles can have multiple tags)
--   - Public read access (no auth required)
--
-- ============================================================================
-- 1. Tags Table
-- ============================================================================

CREATE TABLE public.help_article_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_es text NOT NULL,
  color text NOT NULL DEFAULT 'gray',
  description_en text,
  description_es text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT help_article_tags_slug_check CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT help_article_tags_color_check CHECK (color IN ('blue', 'green', 'red', 'yellow', 'purple', 'gray', 'pink', 'indigo'))
);

-- ============================================================================
-- 2. Article-Tag Junction Table (Many-to-Many)
-- ============================================================================

CREATE TABLE public.help_article_tags_relation (
  article_id uuid NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.help_article_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================================
-- 3. Indexes for Performance
-- ============================================================================

-- For finding all articles with a specific tag
CREATE INDEX idx_article_tags_relation_tag_id ON public.help_article_tags_relation(tag_id);

-- For finding all tags for a specific article
CREATE INDEX idx_article_tags_relation_article_id ON public.help_article_tags_relation(article_id);

-- For tag slug lookups
CREATE INDEX idx_article_tags_slug ON public.help_article_tags(slug);

-- ============================================================================
-- 4. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.help_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_tags_relation ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous users) can view tags
CREATE POLICY "Anyone can view tags"
  ON public.help_article_tags
  FOR SELECT
  TO public
  USING (true);

-- Anyone can view tag relations
CREATE POLICY "Anyone can view tag relations"
  ON public.help_article_tags_relation
  FOR SELECT
  TO public
  USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage tags"
  ON public.help_article_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can manage tag relations
CREATE POLICY "Admins can manage tag relations"
  ON public.help_article_tags_relation
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. Trigger for Updated_at
-- ============================================================================

CREATE TRIGGER set_help_article_tags_updated_at
  BEFORE UPDATE ON public.help_article_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. Helper Functions
-- ============================================================================

-- Function: Get popular tags (most used)
CREATE OR REPLACE FUNCTION public.get_popular_tags(
  limit_count integer DEFAULT 10,
  locale_filter text DEFAULT NULL
)
RETURNS TABLE (
  tag_id uuid,
  slug text,
  name text,
  color text,
  article_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as tag_id,
    t.slug,
    CASE
      WHEN locale_filter = 'es' THEN t.name_es
      ELSE t.name_en
    END as name,
    t.color,
    COUNT(r.article_id) as article_count
  FROM public.help_article_tags t
  LEFT JOIN public.help_article_tags_relation r ON t.id = r.tag_id
  GROUP BY t.id, t.slug, t.name_en, t.name_es, t.color
  HAVING COUNT(r.article_id) > 0
  ORDER BY article_count DESC, t.slug ASC
  LIMIT limit_count;
END;
$$;

-- Function: Get articles by tag
CREATE OR REPLACE FUNCTION public.get_articles_by_tag(
  tag_slug_filter text,
  locale_filter text DEFAULT 'en'
)
RETURNS TABLE (
  article_id uuid,
  title text,
  slug text,
  excerpt text,
  category_slug text,
  view_count integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as article_id,
    a.title,
    a.slug,
    a.excerpt,
    c.slug as category_slug,
    a.view_count,
    a.created_at
  FROM public.help_articles a
  JOIN public.help_categories c ON a.category_id = c.id
  JOIN public.help_article_tags_relation r ON a.id = r.article_id
  JOIN public.help_article_tags t ON r.tag_id = t.id
  WHERE
    a.is_published = true
    AND a.locale = locale_filter
    AND t.slug = tag_slug_filter
  ORDER BY a.view_count DESC, a.created_at DESC;
END;
$$;

-- ============================================================================
-- 7. Seed Common Tags
-- ============================================================================

INSERT INTO public.help_article_tags (slug, name_en, name_es, color, description_en, description_es) VALUES
  ('getting-started', 'Getting Started', 'Primeros Pasos', 'blue', 'Beginner-friendly guides to get you started', 'Guías para principiantes para comenzar'),
  ('payment', 'Payment', 'Pago', 'green', 'Payment processing and billing questions', 'Procesamiento de pagos y facturación'),
  ('troubleshooting', 'Troubleshooting', 'Solución de Problemas', 'red', 'Fix common issues and errors', 'Solucionar problemas y errores comunes'),
  ('mobile', 'Mobile App', 'App Móvil', 'purple', 'Mobile app features and setup', 'Funciones y configuración de la app móvil'),
  ('verification', 'Verification', 'Verificación', 'yellow', 'Identity verification and background checks', 'Verificación de identidad y antecedentes'),
  ('booking', 'Booking', 'Reserva', 'indigo', 'Creating and managing bookings', 'Crear y gestionar reservas'),
  ('professional', 'For Professionals', 'Para Profesionales', 'pink', 'Professional-specific features and guides', 'Funciones y guías para profesionales'),
  ('customer', 'For Customers', 'Para Clientes', 'blue', 'Customer-specific features and guides', 'Funciones y guías para clientes'),
  ('account', 'Account Settings', 'Configuración de Cuenta', 'gray', 'Managing your account and profile', 'Gestionar tu cuenta y perfil');

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE public.help_article_tags IS
  'Tags for categorizing help articles. Supports bilingual names (EN/ES) and color coding.';

COMMENT ON COLUMN public.help_article_tags.slug IS
  'URL-safe unique identifier for the tag (lowercase, hyphenated)';

COMMENT ON COLUMN public.help_article_tags.color IS
  'Color category for visual grouping (blue, green, red, yellow, purple, gray, pink, indigo)';

COMMENT ON TABLE public.help_article_tags_relation IS
  'Many-to-many junction table linking articles to tags. Allows articles to have multiple tags.';

COMMENT ON FUNCTION public.get_popular_tags IS
  'Returns most frequently used tags with article counts. Useful for tag clouds and popular topics.';

COMMENT ON FUNCTION public.get_articles_by_tag IS
  'Returns all published articles with a specific tag, ordered by popularity.';

-- ============================================================================
-- Migration Summary
-- ============================================================================
-- Tables created: 2 (help_article_tags, help_article_tags_relation)
-- Indexes created: 3 (tag_id, article_id, slug)
-- Functions created: 2 (get_popular_tags, get_articles_by_tag)
-- RLS policies: 4 (public read, admin write)
-- Seed data: 9 common tags
--
-- Usage:
--   - View popular tags: SELECT * FROM get_popular_tags(10, 'en');
--   - Get articles by tag: SELECT * FROM get_articles_by_tag('payment', 'en');
--   - Admins can add/edit tags via Supabase dashboard or admin UI
--
