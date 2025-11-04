-- Migration: Create Help Center / Knowledge Base
-- Description: Creates tables for help articles, categories, and feedback with full-text search

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity search

-- Create help categories table
CREATE TABLE IF NOT EXISTS public.help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  icon TEXT, -- Icon name for UI (e.g., 'book-open', 'credit-card')
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create help articles table
CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.help_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_es TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Ensure unique slug within category
  CONSTRAINT unique_category_slug UNIQUE (category_id, slug)
);

-- Create generated tsvector columns for full-text search
-- Weighted: A = title (highest priority), B = excerpt, C = content
ALTER TABLE public.help_articles
  ADD COLUMN search_vector_en tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title_en, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt_en, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content_en, '')), 'C')
  ) STORED;

ALTER TABLE public.help_articles
  ADD COLUMN search_vector_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(title_es, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(excerpt_es, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(content_es, '')), 'C')
  ) STORED;

-- Create article feedback table (helpful/not helpful votes)
CREATE TABLE IF NOT EXISTS public.help_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  is_helpful BOOLEAN NOT NULL,
  feedback_text TEXT, -- Optional feedback comment
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate votes (either by user_id or session_id)
  CONSTRAINT unique_user_article UNIQUE NULLS NOT DISTINCT (article_id, user_id),
  CONSTRAINT unique_session_article UNIQUE NULLS NOT DISTINCT (article_id, session_id),
  CONSTRAINT has_identifier CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Create related articles junction table
CREATE TABLE IF NOT EXISTS public.help_article_relations (
  article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  related_article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (article_id, related_article_id),
  -- Prevent self-relations
  CONSTRAINT no_self_relation CHECK (article_id != related_article_id)
);

-- Create indexes for performance
CREATE INDEX idx_help_categories_slug ON public.help_categories(slug);
CREATE INDEX idx_help_categories_active ON public.help_categories(is_active) WHERE is_active = true;
CREATE INDEX idx_help_categories_order ON public.help_categories(display_order);

CREATE INDEX idx_help_articles_category ON public.help_articles(category_id);
CREATE INDEX idx_help_articles_slug ON public.help_articles(slug);
CREATE INDEX idx_help_articles_published ON public.help_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_help_articles_category_slug ON public.help_articles(category_id, slug);
CREATE INDEX idx_help_articles_order ON public.help_articles(display_order);

-- GIN indexes for full-text search
CREATE INDEX idx_help_articles_search_en ON public.help_articles USING GIN (search_vector_en);
CREATE INDEX idx_help_articles_search_es ON public.help_articles USING GIN (search_vector_es);

CREATE INDEX idx_help_feedback_article ON public.help_article_feedback(article_id);
CREATE INDEX idx_help_feedback_user ON public.help_article_feedback(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_help_relations_article ON public.help_article_relations(article_id);
CREATE INDEX idx_help_relations_related ON public.help_article_relations(related_article_id);

-- Create function to update article helpful counts
CREATE OR REPLACE FUNCTION public.update_article_feedback_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE public.help_articles
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.article_id;
    ELSE
      UPDATE public.help_articles
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote changes
    IF OLD.is_helpful != NEW.is_helpful THEN
      IF NEW.is_helpful THEN
        UPDATE public.help_articles
        SET helpful_count = helpful_count + 1,
            not_helpful_count = not_helpful_count - 1
        WHERE id = NEW.article_id;
      ELSE
        UPDATE public.help_articles
        SET helpful_count = helpful_count - 1,
            not_helpful_count = not_helpful_count + 1
        WHERE id = NEW.article_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE public.help_articles
      SET helpful_count = helpful_count - 1
      WHERE id = OLD.article_id;
    ELSE
      UPDATE public.help_articles
      SET not_helpful_count = not_helpful_count - 1
      WHERE id = OLD.article_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for feedback counts
CREATE TRIGGER update_article_feedback_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.help_article_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_article_feedback_counts();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_article_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.help_articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION public.search_help_articles(
  search_query TEXT,
  locale TEXT DEFAULT 'en',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  category_slug TEXT,
  category_name TEXT,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  rank REAL
) AS $$
BEGIN
  IF locale = 'es' THEN
    RETURN QUERY
    SELECT
      a.id,
      a.category_id,
      c.slug as category_slug,
      c.name_es as category_name,
      a.slug,
      a.title_es as title,
      a.excerpt_es as excerpt,
      ts_rank(a.search_vector_es, websearch_to_tsquery('spanish', search_query)) as rank
    FROM public.help_articles a
    JOIN public.help_categories c ON a.category_id = c.id
    WHERE
      a.is_published = true
      AND c.is_active = true
      AND a.search_vector_es @@ websearch_to_tsquery('spanish', search_query)
    ORDER BY rank DESC, a.view_count DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT
      a.id,
      a.category_id,
      c.slug as category_slug,
      c.name_en as category_name,
      a.slug,
      a.title_en as title,
      a.excerpt_en as excerpt,
      ts_rank(a.search_vector_en, websearch_to_tsquery('english', search_query)) as rank
    FROM public.help_articles a
    JOIN public.help_categories c ON a.category_id = c.id
    WHERE
      a.is_published = true
      AND c.is_active = true
      AND a.search_vector_en @@ websearch_to_tsquery('english', search_query)
    ORDER BY rank DESC, a.view_count DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_help_categories_updated_at
  BEFORE UPDATE ON public.help_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
  BEFORE UPDATE ON public.help_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_relations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for published content

-- Categories: Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
  ON public.help_categories FOR SELECT
  USING (is_active = true);

-- Articles: Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON public.help_articles FOR SELECT
  USING (is_published = true);

-- Feedback: Anyone can insert feedback (for anonymous users)
CREATE POLICY "Anyone can submit feedback"
  ON public.help_article_feedback FOR INSERT
  WITH CHECK (true);

-- Feedback: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.help_article_feedback FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
  );

-- Relations: Anyone can view article relations
CREATE POLICY "Anyone can view article relations"
  ON public.help_article_relations FOR SELECT
  USING (true);

-- Insert seed data for help categories
INSERT INTO public.help_categories (slug, name_en, name_es, description_en, description_es, icon, display_order) VALUES
  ('getting-started', 'Getting Started', 'Primeros Pasos', 'Learn the basics of using Casaora', 'Aprende los conceptos básicos de Casaora', 'rocket', 1),
  ('booking', 'Booking & Scheduling', 'Reservas y Programación', 'Everything about creating and managing bookings', 'Todo sobre crear y gestionar reservas', 'calendar', 2),
  ('payments', 'Payments & Billing', 'Pagos y Facturación', 'Payment methods, billing, and refunds', 'Métodos de pago, facturación y reembolsos', 'credit-card', 3),
  ('safety', 'Safety & Trust', 'Seguridad y Confianza', 'Background checks, insurance, and safety guidelines', 'Verificaciones, seguros y pautas de seguridad', 'shield-check', 4),
  ('troubleshooting', 'Troubleshooting', 'Solución de Problemas', 'Common issues and how to resolve them', 'Problemas comunes y cómo resolverlos', 'wrench', 5)
ON CONFLICT (slug) DO NOTHING;

-- Add comment documentation
COMMENT ON TABLE public.help_categories IS 'Help center article categories';
COMMENT ON TABLE public.help_articles IS 'Help center articles with bilingual content and full-text search';
COMMENT ON TABLE public.help_article_feedback IS 'User feedback on help articles (helpful/not helpful)';
COMMENT ON TABLE public.help_article_relations IS 'Related articles for cross-referencing';
COMMENT ON FUNCTION public.search_help_articles IS 'Full-text search for help articles with ranking';
COMMENT ON FUNCTION public.increment_article_view_count IS 'Increment article view counter';
