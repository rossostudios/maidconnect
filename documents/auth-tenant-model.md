# Auth & Tenant Model Blueprint

## Goals
- Support distinct SaaS experiences for professionals, customers, and admins under a single Supabase project.
- Centralize identity in Supabase Auth while storing role-specific metadata inside a shared `profiles` table.
- Enable bilingual UX, locale-aware communications, and future expansion into city-specific markets.
- Provide consistent session handling across server and client components in Next.js App Router.

## Architecture Overview
1. **Supabase Auth (Email/Password + OAuth as future)**  
   - Leverage Supabase Auth for secure credential storage and session issuance.  
   - Enable email link + password flows; keep social providers optional for later phases.  
   - Enforce email verification before granting dashboard access.
2. **Profiles Table (Tenant Switchboard)**  
   - Each Auth user has exactly one `profiles` row keyed by `auth.users.id`.  
   - Core columns: `role` (`customer` | `professional` | `admin`), `onboarding_status`, `locale`, `phone`, `country`, `city`, timestamps.  
   - Store professional/customer specific data in dedicated tables that reference `profiles.id`.
3. **Role-Specific Tables**  
   - `professional_profiles`: experience, services, verification badges, onboarding milestones.  
   - `customer_profiles`: property preferences, default address, verification tier.  
   - Additional tables (bookings, listings, payouts) link to `profiles.id` to maintain consistent tenant lookups.
4. **Access Control**  
   - Supabase Row-Level Security policies gate tables by `auth.uid()` → `profiles.role`.  
   - Admins bypass restrictions for support tooling.  
   - Edge cases (support impersonation) handled through signed JWTs issued by service role.
5. **Next.js Integration**  
   - Shared auth helpers (`getUser`, `requireRole`) in `src/lib/auth`.  
   - Route groups for `/dashboard/pro` and `/dashboard/customer` with middleware enforcing role checks.  
   - Public marketing site lives outside middleware scope.

## Data Model Snapshot
```mermaid
erDiagram
    auth_users {
      uuid id PK
      text email
      text raw_user_meta_data
    }
    profiles {
      uuid id PK FK -> auth_users.id
      text role
      text locale
      text phone
      text country
      text city
      text onboarding_status
      timestamptz created_at
      timestamptz updated_at
    }
    professional_profiles {
      uuid profile_id PK FK -> profiles.id
      text status
      jsonb services
      text bio
      text verification_level
      timestamptz onboarding_completed_at
    }
    customer_profiles {
      uuid profile_id PK FK -> profiles.id
      text verification_tier
      jsonb property_preferences
      uuid default_address_id
    }
```

## Role Lifecycle
- **Professional**: Registers → `profiles.role = professional`, onboarding status defaults to `application_pending`. Upgrades as vetting steps complete. Denied applicants remain but cannot access dashboard.
- **Customer**: Registers → `profiles.role = customer`, verification tier defaults to basic. Additional checks elevate status.
- **Admin**: Provisioned manually via Supabase Admin dashboard or service script; must have `profiles.role = admin`.

## Middleware Rules
- `/dashboard/pro/**` requires `role === "professional"` and `onboarding_status !== "suspended"`.
- `/dashboard/customer/**` requires `role === "customer"` with verified email.
- `/admin/**` requires `role === "admin"`.
- Auth routes (`/auth/**/*`) remain public; redirect authenticated users to their dashboard home.

## Open Questions
- Confirm if professionals require separate company accounts long-term (multi-user teams).  
- Determine localization fallback when locale missing (default `en-US`).  
- Define process for role switching (e.g., customer becomes professional).

## Next Steps
1. Commit Supabase migration establishing `profiles`, `professional_profiles`, `customer_profiles`.  
2. Implement `src/lib/auth/session.ts` utilities and middleware enforcement.  
3. Scaffold public `/auth/sign-in` and `/auth/sign-up` routes with role selection.  
4. Configure Supabase Auth email templates (outside repo) for bilingual onboarding.  
5. Draft support script for promoting/demoting roles (admin tooling epic).

