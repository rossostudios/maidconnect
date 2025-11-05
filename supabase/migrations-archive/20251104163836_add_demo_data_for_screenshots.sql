-- Demo Data for Marketing Screenshots
-- This migration automatically creates demo users and all related data
-- No manual steps required!
--
-- Demo accounts that will be created:
-- 1. demo-customer@casaora.com (Password: DemoPass123!)
-- 2. demo-pro@casaora.com (Password: DemoPass123!)
-- 3. demo-admin@casaora.com (Password: DemoPass123!)

-- ============================================================================
-- STEP 1: Create demo auth users
-- ============================================================================
DO $$
DECLARE
  demo_customer_id UUID;
  demo_pro_id UUID;
  demo_admin_id UUID;
  demo_pro2_id UUID;
  demo_pro3_id UUID;
  demo_pro4_id UUID;
  demo_pro5_id UUID;

  booking1_id UUID;
  booking2_id UUID;
  booking3_id UUID;
  booking4_id UUID;
  booking5_id UUID;
  booking6_id UUID;
  booking7_id UUID;

  encrypted_password TEXT;
BEGIN

-- Generate password hash for "DemoPass123!"
-- Using crypt() function with bcrypt
encrypted_password := crypt('DemoPass123!', gen_salt('bf'));

-- Create customer auth user
demo_customer_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_customer_id,
  '00000000-0000-0000-0000-000000000000',
  'demo-customer@casaora.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '3 months',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"customer"}'::jsonb,
  '{"full_name":"María González","role":"customer"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- Create customer identity
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'demo-customer@casaora.com',
  demo_customer_id,
  jsonb_build_object('sub', demo_customer_id::text, 'email', 'demo-customer@casaora.com'),
  'email',
  NOW(),
  NOW() - INTERVAL '3 months',
  NOW()
);

-- Create professional auth user
demo_pro_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_pro_id,
  '00000000-0000-0000-0000-000000000000',
  'demo-pro@casaora.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '2 months',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"professional"}'::jsonb,
  '{"full_name":"Ana María Rodríguez","role":"professional"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- Create professional identity
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'demo-pro@casaora.com',
  demo_pro_id,
  jsonb_build_object('sub', demo_pro_id::text, 'email', 'demo-pro@casaora.com'),
  'email',
  NOW(),
  NOW() - INTERVAL '2 months',
  NOW()
);

-- Create admin auth user
demo_admin_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_admin_id,
  '00000000-0000-0000-0000-000000000000',
  'demo-admin@casaora.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '6 months',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"full_name":"Admin User","role":"admin"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- Create admin identity
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'demo-admin@casaora.com',
  demo_admin_id,
  jsonb_build_object('sub', demo_admin_id::text, 'email', 'demo-admin@casaora.com'),
  'email',
  NOW(),
  NOW() - INTERVAL '6 months',
  NOW()
);

-- Create additional professional users for vetting queue
demo_pro2_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_pro2_id,
  '00000000-0000-0000-0000-000000000000',
  'carlos.mendoza@example.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '5 days',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"professional"}'::jsonb,
  '{"full_name":"Carlos Mendoza","role":"professional"}'::jsonb,
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('carlos.mendoza@example.com', demo_pro2_id, jsonb_build_object('sub', demo_pro2_id::text, 'email', 'carlos.mendoza@example.com'), 'email', NOW(), NOW() - INTERVAL '5 days', NOW());

demo_pro3_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_pro3_id,
  '00000000-0000-0000-0000-000000000000',
  'laura.fernandez@example.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '3 days',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"professional"}'::jsonb,
  '{"full_name":"Laura Fernández","role":"professional"}'::jsonb,
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('laura.fernandez@example.com', demo_pro3_id, jsonb_build_object('sub', demo_pro3_id::text, 'email', 'laura.fernandez@example.com'), 'email', NOW(), NOW() - INTERVAL '3 days', NOW());

demo_pro4_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_pro4_id,
  '00000000-0000-0000-0000-000000000000',
  'diego.torres@example.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '10 days',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"professional"}'::jsonb,
  '{"full_name":"Diego Torres","role":"professional"}'::jsonb,
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('diego.torres@example.com', demo_pro4_id, jsonb_build_object('sub', demo_pro4_id::text, 'email', 'diego.torres@example.com'), 'email', NOW(), NOW() - INTERVAL '10 days', NOW());

demo_pro5_id := gen_random_uuid();
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  demo_pro5_id,
  '00000000-0000-0000-0000-000000000000',
  'sofia.ramirez@example.com',
  encrypted_password,
  NOW(),
  NOW() - INTERVAL '1 month',
  NOW(),
  '{"provider":"email","providers":["email"],"role":"professional"}'::jsonb,
  '{"full_name":"Sofia Ramirez","role":"professional"}'::jsonb,
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('sofia.ramirez@example.com', demo_pro5_id, jsonb_build_object('sub', demo_pro5_id::text, 'email', 'sofia.ramirez@example.com'), 'email', NOW(), NOW() - INTERVAL '1 month', NOW());

-- ============================================================================
-- STEP 2: Create profiles
-- ============================================================================

-- Customer profile
INSERT INTO public.profiles (id, role, full_name, phone, country, city, created_at, updated_at)
VALUES (
  demo_customer_id,
  'customer',
  'María González',
  '+57 300 123 4567',
  'Colombia',
  'Bogotá',
  NOW() - INTERVAL '3 months',
  NOW()
);

-- Professional profile 1 (main demo pro)
INSERT INTO public.profiles (id, role, full_name, phone, country, city, onboarding_status, created_at, updated_at)
VALUES (
  demo_pro_id,
  'professional',
  'Ana María Rodríguez',
  '+57 301 234 5678',
  'Colombia',
  'Bogotá',
  'approved',
  NOW() - INTERVAL '2 months',
  NOW()
);

-- Admin profile
INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
VALUES (
  demo_admin_id,
  'admin',
  'Admin User',
  NOW() - INTERVAL '6 months',
  NOW()
);

-- Additional professional profiles (for vetting queue)
INSERT INTO public.profiles (id, role, full_name, phone, country, city, onboarding_status, created_at, updated_at)
VALUES
  (demo_pro2_id, 'professional', 'Carlos Mendoza', '+57 302 345 6789', 'Colombia', 'Medellín', 'application_in_review', NOW() - INTERVAL '5 days', NOW()),
  (demo_pro3_id, 'professional', 'Laura Fernández', '+57 303 456 7890', 'Colombia', 'Cali', 'application_in_review', NOW() - INTERVAL '3 days', NOW()),
  (demo_pro4_id, 'professional', 'Diego Torres', '+57 304 567 8901', 'Colombia', 'Barranquilla', 'application_pending', NOW() - INTERVAL '10 days', NOW()),
  (demo_pro5_id, 'professional', 'Sofia Ramirez', '+57 305 678 9012', 'Colombia', 'Cartagena', 'approved', NOW() - INTERVAL '1 month', NOW());

-- ============================================================================
-- STEP 3: Create professional records
-- ============================================================================

-- Main demo professional (complete profile)
INSERT INTO public.professionals (
  profile_id,
  bio,
  primary_services,
  experience_years,
  rate_expectations,
  languages,
  consent_background_check,
  references_data,
  stripe_connect_account_id,
  created_at,
  updated_at
)
VALUES (
  demo_pro_id,
  'Experienced house cleaning professional with 8 years of expertise in residential and commercial cleaning. Specialized in deep cleaning, eco-friendly practices, and attention to detail. Dedicated to providing exceptional service and maintaining the highest standards of cleanliness.',
  ARRAY['House Cleaning', 'Deep Cleaning', 'Move In/Out Cleaning', 'Eco-Friendly Cleaning']::TEXT[],
  8,
  '{"hourly_cop": 2500000}'::JSONB,
  ARRAY['Spanish', 'English']::TEXT[],
  true,
  '[{"name": "María López", "contact": "+57 300 111 2222", "relationship": "Former Client"}, {"name": "Juan Pérez", "contact": "+57 301 222 3333", "relationship": "Property Manager"}]'::JSONB,
  'acct_demo_stripe_123',
  NOW() - INTERVAL '2 months',
  NOW()
);

-- Additional professionals (for vetting queue)
INSERT INTO public.professionals (
  profile_id,
  bio,
  primary_services,
  experience_years,
  rate_expectations,
  languages,
  consent_background_check,
  references_data,
  created_at,
  updated_at
)
VALUES
  (
    demo_pro2_id,
    'Dedicated cleaning professional with 5 years of experience in residential cleaning.',
    ARRAY['House Cleaning', 'Apartment Cleaning']::TEXT[],
    5,
    '{"hourly_cop": 2000000}'::JSONB,
    ARRAY['Spanish']::TEXT[],
    true,
    '[]'::JSONB,
    NOW() - INTERVAL '5 days',
    NOW()
  ),
  (
    demo_pro3_id,
    'Professional cleaner specializing in deep cleaning and organization services.',
    ARRAY['Deep Cleaning', 'Organization', 'Post-Construction Cleaning']::TEXT[],
    3,
    '{"hourly_cop": 2200000}'::JSONB,
    ARRAY['Spanish', 'English']::TEXT[],
    true,
    '[{"name": "Test Reference", "contact": "+57 300 000 0000"}]'::JSONB,
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    demo_pro4_id,
    'Entry-level cleaning professional eager to start career.',
    ARRAY['House Cleaning']::TEXT[],
    1,
    '{"hourly_cop": 1800000}'::JSONB,
    ARRAY['Spanish']::TEXT[],
    false,
    '[]'::JSONB,
    NOW() - INTERVAL '10 days',
    NOW()
  ),
  (
    demo_pro5_id,
    'Experienced professional with expertise in luxury home cleaning.',
    ARRAY['Luxury Home Cleaning', 'Deep Cleaning', 'Window Cleaning']::TEXT[],
    6,
    '{"hourly_cop": 2800000}'::JSONB,
    ARRAY['Spanish', 'English', 'French']::TEXT[],
    true,
    '[{"name": "Reference 1", "contact": "+57 300 000 0001"}, {"name": "Reference 2", "contact": "+57 300 000 0002"}]'::JSONB,
    NOW() - INTERVAL '1 month',
    NOW()
  );

-- ============================================================================
-- STEP 4: Create customer addresses
-- ============================================================================

INSERT INTO public.customer_addresses (
  customer_id,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  country,
  is_default,
  created_at,
  updated_at
)
VALUES
  (demo_customer_id, 'Calle 100 #15-30', 'Apartamento 502', 'Bogotá', 'Cundinamarca', '110111', 'Colombia', true, NOW() - INTERVAL '2 months', NOW()),
  (demo_customer_id, 'Carrera 7 #85-20', 'Casa', 'Bogotá', 'Cundinamarca', '110221', 'Colombia', false, NOW() - INTERVAL '1 month', NOW());

-- ============================================================================
-- STEP 5: Create bookings with various statuses
-- ============================================================================

-- Upcoming booking 1 (confirmed)
booking1_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  amount_captured,
  currency,
  created_at,
  updated_at
)
VALUES (
  booking1_id,
  demo_customer_id,
  demo_pro_id,
  'confirmed',
  'Deep Cleaning Service',
  NOW() + INTERVAL '3 days' + INTERVAL '10 hours',
  180,
  15000000, -- 150,000 COP (stored as cents)
  NULL,
  'COP',
  NOW() - INTERVAL '2 days',
  NOW()
);

-- Upcoming booking 2 (confirmed)
booking2_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  amount_captured,
  currency,
  created_at,
  updated_at
)
VALUES (
  booking2_id,
  demo_customer_id,
  demo_pro5_id,
  'confirmed',
  'Standard Cleaning',
  NOW() + INTERVAL '5 days' + INTERVAL '14 hours',
  120,
  10000000, -- 100,000 COP
  NULL,
  'COP',
  NOW() - INTERVAL '1 day',
  NOW()
);

-- Recent completed booking
booking3_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  amount_captured,
  currency,
  completed_at,
  created_at,
  updated_at
)
VALUES (
  booking3_id,
  demo_customer_id,
  demo_pro_id,
  'completed',
  'Move In Cleaning',
  NOW() - INTERVAL '5 days',
  240,
  20000000, -- 200,000 COP
  20000000,
  'COP',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days'
);

-- Another completed booking
booking4_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  amount_captured,
  currency,
  completed_at,
  created_at,
  updated_at
)
VALUES (
  booking4_id,
  demo_customer_id,
  demo_pro_id,
  'completed',
  'Standard Cleaning',
  NOW() - INTERVAL '2 weeks',
  120,
  10000000,
  10000000,
  'COP',
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks' - INTERVAL '1 day',
  NOW() - INTERVAL '2 weeks'
);

-- Canceled booking
booking5_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  currency,
  created_at,
  updated_at
)
VALUES (
  booking5_id,
  demo_customer_id,
  demo_pro5_id,
  'canceled',
  'Deep Cleaning Service',
  NOW() - INTERVAL '1 week',
  180,
  15000000,
  'COP',
  NOW() - INTERVAL '1 week' - INTERVAL '2 days',
  NOW() - INTERVAL '1 week'
);

-- Professional's additional bookings for their dashboard
booking6_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  currency,
  created_at,
  updated_at
)
VALUES (
  booking6_id,
  demo_customer_id,
  demo_pro_id,
  'confirmed',
  'Eco-Friendly Cleaning',
  NOW() + INTERVAL '2 days' + INTERVAL '9 hours',
  150,
  12500000,
  'COP',
  NOW() - INTERVAL '3 days',
  NOW()
);

booking7_id := gen_random_uuid();
INSERT INTO public.bookings (
  id,
  customer_id,
  professional_id,
  status,
  service_name,
  scheduled_start,
  duration_minutes,
  amount_authorized,
  currency,
  created_at,
  updated_at
)
VALUES (
  booking7_id,
  demo_customer_id,
  demo_pro_id,
  'authorized',
  'Standard Cleaning',
  NOW() + INTERVAL '7 days' + INTERVAL '15 hours',
  120,
  10000000,
  'COP',
  NOW() - INTERVAL '1 hour',
  NOW()
);

-- ============================================================================
-- STEP 6: Create favorites
-- ============================================================================

INSERT INTO public.customer_favorites (customer_id, professional_id, created_at)
VALUES
  (demo_customer_id, demo_pro_id, NOW() - INTERVAL '1 month'),
  (demo_customer_id, demo_pro5_id, NOW() - INTERVAL '2 weeks');

-- ============================================================================
-- STEP 7: Create professional documents (for vetting queue)
-- ============================================================================

INSERT INTO public.professional_documents (profile_id, document_type, file_url, uploaded_at)
VALUES
  (demo_pro2_id, 'national_id', 'https://demo.com/doc1.pdf', NOW() - INTERVAL '5 days'),
  (demo_pro2_id, 'background_check', 'https://demo.com/doc2.pdf', NOW() - INTERVAL '5 days'),
  (demo_pro3_id, 'national_id', 'https://demo.com/doc3.pdf', NOW() - INTERVAL '3 days'),
  (demo_pro3_id, 'background_check', 'https://demo.com/doc4.pdf', NOW() - INTERVAL '3 days'),
  (demo_pro3_id, 'certification', 'https://demo.com/doc5.pdf', NOW() - INTERVAL '3 days');

-- ============================================================================
-- STEP 8: Create admin review records (for vetting queue)
-- ============================================================================

INSERT INTO public.professional_reviews (
  professional_id,
  reviewer_id,
  status,
  notes,
  internal_notes,
  documents_verified,
  references_verified,
  background_check_passed,
  created_at
)
VALUES
  (demo_pro3_id, demo_admin_id, 'in_review', NULL, 'Initial review started', false, false, NULL, NOW() - INTERVAL '2 days');

-- Success message
RAISE NOTICE '✅ Demo data created successfully!';
RAISE NOTICE '';
RAISE NOTICE '📧 Demo Accounts Created:';
RAISE NOTICE '   Customer: demo-customer@casaora.com (Password: DemoPass123!)';
RAISE NOTICE '   Professional: demo-pro@casaora.com (Password: DemoPass123!)';
RAISE NOTICE '   Admin: demo-admin@casaora.com (Password: DemoPass123!)';
RAISE NOTICE '';
RAISE NOTICE '📊 Demo Data Includes:';
RAISE NOTICE '   ✓ 7 bookings (2 upcoming, 3 completed, 1 canceled, 1 authorized)';
RAISE NOTICE '   ✓ 2 customer addresses';
RAISE NOTICE '   ✓ 2 favorite professionals';
RAISE NOTICE '   ✓ 5 professionals in vetting queue';
RAISE NOTICE '   ✓ Professional documents and reviews';
RAISE NOTICE '';
RAISE NOTICE '🚀 Ready for screenshots! Login and explore the dashboards.';

END $$;
