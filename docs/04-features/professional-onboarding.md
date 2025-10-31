# Professional Onboarding Flow (MVP)

## Objectives
- Satisfy P0 user stories 1.1.1, 1.1.2, and 1.1.5 in [user-stories.md](../01-product/user-stories.md).
- Guide newly registered professionals through required steps without concierge intervention.
- Persist progress so partially completed onboarding can resume.

## Flow Overview
1. **Application Form (`application_pending`)**
   - Collect personal info: full name, ID number, phone, email (pre-filled), country, city.
   - Service details: primary services (checkboxes), experience level, rate expectations, availability weekdays.
   - References: at least two entries (name, relationship, phone/email).
   - Consent to background check & terms.
   - Submission transitions onboarding_status → `application_in_review`.
2. **Document Upload (`application_in_review`)**
   - Upload required documents (ID, proof of address) + optional certifications.
   - Capture doc metadata (type, filename, uploaded_at) and store in Supabase Storage.
   - Display review timeline (“3-5 business days”) and support contact.
3. **Profile Build (`approved`)**
   - Bio editor (150-300 words), languages selection, services/pricing matrix, availability scheduler.
   - Preview card and submit for final approval.
   - Completion transitions onboarding_status → `active`.

## UI Surfaces
- `/dashboard/pro` summary card (“Complete your onboarding” progress bar).
- `/dashboard/pro/onboarding` wizard with stepper navigation.
- Document upload handled in-step with drag/drop component and status list.

## Data Model Implications
- Extend `professional_profiles`:
  - `full_name text` (for verification vs. marketing display).
  - `experience_years integer`.
  - `primary_services text[]`.
  - `rate_expectations jsonb`.
  - `languages text[]`.
  - `availability jsonb`.
  - `references jsonb`.
- New table `professional_documents`:
  - `id uuid default gen_random_uuid()`.
  - `profile_id uuid references professional_profiles(profile_id)`.
  - `document_type text`.
  - `storage_path text`.
  - `status text default 'uploaded'`.
  - `uploaded_at timestamptz default now()`.

## Open Questions
- Do we need separate “marketing name” vs. legal name fields?
- Should rate expectations convert to COP/hour automatically or allow multiple currencies?
- Which Supabase Storage bucket should serve professional docs (e.g., `professional-documents`)?

## Next Actions
1. Add schema columns + document table via migration.
2. Implement onboarding wizard skeleton with mocked save handlers.
3. Connect save handlers to Supabase once storage choices finalized.
