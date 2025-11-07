-- Migration: Seed Help Center Categories
-- Description: Insert 7 help categories for customer and professional help center
-- Author: MaidConnect Team
-- Date: 2025-11-07
--
-- This migration seeds the initial help categories that will organize all help articles.
-- Categories include English and Spanish names/descriptions for bilingual support.
--
-- ============================================================================
-- SEED HELP CATEGORIES
-- ============================================================================

-- Insert 7 help categories with bilingual content
INSERT INTO public.help_categories (
  slug,
  icon,
  name_en,
  name_es,
  description_en,
  description_es,
  display_order
) VALUES
  -- Category 1: Getting Started
  (
    'getting-started',
    'rocket',
    'Getting Started',
    'Primeros Pasos',
    'New to MaidConnect? Start here to learn how the platform works, create your account, and get ready for your first booking or service.',
    '¿Nuevo en MaidConnect? Comience aquí para aprender cómo funciona la plataforma, crear su cuenta y prepararse para su primera reserva o servicio.',
    1
  ),

  -- Category 2: Bookings & Scheduling
  (
    'bookings-scheduling',
    'calendar',
    'Bookings & Scheduling',
    'Reservas y Programación',
    'Learn how to create, manage, and modify bookings. Understand cancellation policies, rescheduling options, and what to do if issues arise.',
    'Aprenda cómo crear, administrar y modificar reservas. Comprenda las políticas de cancelación, opciones de reprogramación y qué hacer si surgen problemas.',
    2
  ),

  -- Category 3: Payments & Refunds
  (
    'payments-refunds',
    'credit-card',
    'Payments & Refunds',
    'Pagos y Reembolsos',
    'Understand how payments work, when you''ll be charged, refund policies, and how to manage your payment methods securely.',
    'Comprenda cómo funcionan los pagos, cuándo se le cobrará, las políticas de reembolso y cómo administrar sus métodos de pago de forma segura.',
    3
  ),

  -- Category 4: Communication
  (
    'communication',
    'book-open',
    'Communication',
    'Comunicación',
    'Learn how to use in-app messaging, automatic translation, and best practices for professional communication between customers and professionals.',
    'Aprenda a usar la mensajería en la aplicación, la traducción automática y las mejores prácticas para la comunicación profesional entre clientes y profesionales.',
    4
  ),

  -- Category 5: Reviews & Ratings
  (
    'reviews-ratings',
    'book-open',
    'Reviews & Ratings',
    'Reseñas y Calificaciones',
    'Learn how the review system works, how to leave and receive reviews, and understand how ratings impact success on the platform.',
    'Aprenda cómo funciona el sistema de reseñas, cómo dejar y recibir reseñas y comprenda cómo las calificaciones impactan el éxito en la plataforma.',
    5
  ),

  -- Category 6: Safety & Trust
  (
    'safety-trust',
    'shield-check',
    'Safety & Trust',
    'Seguridad y Confianza',
    'Learn about verification processes, safety measures, background checks, and how MaidConnect ensures a safe experience for everyone.',
    'Conozca los procesos de verificación, medidas de seguridad, verificación de antecedentes y cómo MaidConnect garantiza una experiencia segura para todos.',
    6
  ),

  -- Category 7: Account & Settings
  (
    'account-settings',
    'wrench',
    'Account & Settings',
    'Cuenta y Configuración',
    'Manage your account, update your profile, change settings, and control your privacy preferences on MaidConnect.',
    'Administre su cuenta, actualice su perfil, cambie la configuración y controle sus preferencias de privacidad en MaidConnect.',
    7
  )
ON CONFLICT (slug) DO NOTHING; -- Prevent duplicate inserts if migration is run multiple times

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all 7 categories were inserted
DO $$
DECLARE
  category_count integer;
BEGIN
  SELECT COUNT(*) INTO category_count FROM public.help_categories;

  IF category_count < 7 THEN
    RAISE WARNING 'Expected 7 help categories, but found only %. Migration may have partially failed.', category_count;
  ELSE
    RAISE NOTICE 'Successfully seeded % help categories', category_count;
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.help_categories IS 'Help center categories for organizing articles (customer and professional facing)';
COMMENT ON COLUMN public.help_categories.slug IS 'URL-friendly category identifier';
COMMENT ON COLUMN public.help_categories.icon IS 'Icon name for category (rocket, calendar, credit-card, book-open, shield-check, wrench)';
COMMENT ON COLUMN public.help_categories.name_en IS 'Category name in English';
COMMENT ON COLUMN public.help_categories.name_es IS 'Category name in Spanish (Colombian)';
COMMENT ON COLUMN public.help_categories.description_en IS 'Category description in English';
COMMENT ON COLUMN public.help_categories.description_es IS 'Category description in Spanish (Colombian)';
COMMENT ON COLUMN public.help_categories.display_order IS 'Display order for categories (1 = first, 7 = last)';
