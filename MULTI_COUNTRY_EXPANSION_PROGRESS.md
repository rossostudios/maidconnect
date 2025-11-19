# Multi-Country Expansion Implementation Progress

**Expansion Target:** Paraguay (PY), Uruguay (UY), Argentina (AR)
**Existing Country:** Colombia (CO)
**Status:** Phase 1 & 2 Complete ✅ | Phases 3-7 In Progress ⏳
**Last Updated:** 2025-11-19

---

## ✅ COMPLETED WORK (Phases 1-2)

### Phase 1: Database Foundation ✅

**Migration File Created:** `supabase/migrations/20251119170320_add_multi_country_support.sql`

#### Created Reference Tables:
- ✅ **`countries` table** - Stores country metadata (code, names, currency, payment processor)
- ✅ **`cities` table** - Stores cities per country with slugs for URL-friendly routing
- ✅ **`neighborhoods` table** - Stores neighborhood/district data per city

#### Seeded Data:
- ✅ **Countries:** CO (Colombia), PY (Paraguay), UY (Uruguay), AR (Argentina)
- ✅ **Cities:**
  - **Colombia (7):** Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira
  - **Paraguay (3):** Asunción, Ciudad del Este, Encarnación
  - **Uruguay (3):** Montevideo, Punta del Este, Maldonado
  - **Argentina (4):** Buenos Aires, Córdoba, Rosario, Mendoza
- ✅ **Neighborhoods:** Colombian cities (Bogotá, Medellín, Cali, Cartagena, Barranquilla)

#### Database Schema Updates:
- ✅ **`pricing_controls` table:** Removed `DEFAULT 'Colombia'`, migrated to ISO codes (CO, PY, UY, AR)
- ✅ **RLS Policies:** Public read access for reference tables, admin-only write access
- ✅ **Helper Functions:** `get_cities_by_country()`, `get_neighborhoods_by_city()`, `get_country_info()`

---

### Phase 2: Configuration & Constants ✅

**Config File Created:** `src/lib/shared/config/territories.ts`

#### TypeScript Type Definitions:
- ✅ `CountryCode` - Union type for "CO" | "PY" | "UY" | "AR"
- ✅ `CurrencyCode` - Union type for "COP" | "PYG" | "UYU" | "ARS" | "USD"
- ✅ `PaymentProcessor` - Union type for "stripe" | "paypal"

#### Exported Constants:
- ✅ **`COUNTRIES`** - Record of all country configurations with currency & payment processor mapping
- ✅ **`CITIES_BY_COUNTRY`** - Nested object of cities grouped by country code
- ✅ **`NEIGHBORHOODS_BY_CITY`** - Neighborhood data for Colombian cities
- ✅ **`CURRENCIES`** - Currency metadata (symbol, decimals, separators)

#### Helper Functions:
- ✅ `getCitiesByCountry(countryCode)` - Returns cities for a specific country
- ✅ `getCurrencyByCountry(countryCode)` - Returns currency config for a country
- ✅ `usesStripe(countryCode)` - Boolean check for Stripe usage
- ✅ `usesPayPal(countryCode)` - Boolean check for PayPal usage

#### Currency Support (`src/lib/format.ts`):
- ✅ **Type Updates:** `Currency` type now includes "ARS", "UYU", "PYG"
- ✅ **Locale Updates:** `Locale` type now includes "es-AR", "es-UY", "es-PY"
- ✅ **Decimal Logic:** Updated `formatCurrency()` to handle 0 decimals (COP, PYG) vs 2 decimals (ARS, UYU, USD)
- ✅ **Convenience Functions:** Added `formatARS()`, `formatUYU()`, `formatPYG()`

#### Pricing Types (`src/types/pricing.ts`):
- ✅ **Removed Hardcoded Cities:** Now imports `CITIES` from centralized config
- ✅ **Backward Compatible:** Legacy export maintained for existing code

---

### Phase 3: Application Updates (Partial) ⏳

#### ✅ Completed:
- **Auth Signup (`src/app/[locale]/auth/sign-up/actions.ts`):**
  - ✅ Added `country` field extraction from form data
  - ✅ Updated `buildUserMetadata()` to use dynamic country (defaults to "CO" for backward compatibility)

- **Booking Validation (`src/lib/validations/booking.ts`):**
  - ✅ Updated `addressSchema` with comment explaining multi-country support
  - ✅ Kept "CO" default for backward compatibility but documented need for explicit country

#### ⏳ Remaining (High Priority):

**1. Stripe Connect Route** (`src/app/api/pro/stripe/connect/route.ts`)
```typescript
// NEEDS UPDATE - Line 33: country: "CO" is hardcoded
// TODO: Add conditional logic:
// - If countryCode === 'CO' | 'UY' | 'AR' → Use Stripe Connect
// - If countryCode === 'PY' → Redirect to PayPal onboarding (not yet implemented)
```

**2. Background Checks** (`src/lib/background-checks/truoraClient.ts`)
```typescript
// NEEDS UPDATE - Line 73: country: "CO" is hardcoded
// TODO: Make country-specific
// - Pass country parameter from professional profile
// - Add document type mapping:
//   - CO: CC (Cédula de Ciudadanía), CE, PA
//   - PY: CI (Cédula de Identidad)
//   - UY: CI (Cédula de Identidad)
//   - AR: DNI (Documento Nacional de Identidad)
// NOTE: Truora may not operate in PY/UY/AR - research alternative providers
```

---

## ⏳ REMAINING WORK (Phases 4-7)

### Phase 4: UI Component Updates (Critical)

**1. Match Wizard Location Step** (`src/components/match-wizard/steps/location-step.tsx`)
- ❌ **NEEDS:** Add country selector dropdown
- ❌ **NEEDS:** Update city dropdown to filter by selected country
- ❌ **NEEDS:** Update neighborhood data to use `NEIGHBORHOODS_BY_CITY` from territories config
- **Current State:** Hardcoded Colombian cities (lines 15-21) and neighborhoods (lines 23-53)

**2. Brief Form** (`src/components/brief/brief-form.tsx`)
- ❌ **NEEDS:** Add country selector dropdown above city dropdown
- ❌ **NEEDS:** Update city dropdown to filter by selected country using `getCitiesByCountry()`
- **Current State:** Hardcoded Colombian cities (lines 51-58)

**3. Professional Onboarding** (`src/app/[locale]/dashboard/pro/onboarding/page.tsx`)
- ❌ **NEEDS:** Update `COUNTRY_OPTIONS` to use `COUNTRY_OPTIONS` from territories config
- ❌ **NEEDS:** Remove "Other" option (we now support specific countries only)
- **Current State:** Hardcoded list of countries (lines 31-38)

**4. Professional Onboarding Form** (`src/app/[locale]/dashboard/pro/onboarding/application-form.tsx`)
- ❌ **NEEDS:** Update dropdown to use new country options
- ❌ **NEEDS:** Update city selector to be dynamic based on selected country
- **Current State:** `defaultValue="Colombia"` (line 72)

---

### Phase 5: PayPal Integration (New Feature)

**Critical for Paraguay** - Stripe Connect not available in Paraguay.

#### Files to Create:

**1. PayPal Client** (`src/lib/integrations/paypal/client.ts`) ❌
```typescript
// TODO: Implement PayPal Partner Referrals API
// - Create merchant onboarding flow (PayPal equivalent of Stripe Connect)
// - Generate referral links for professional signup
// - Handle OAuth callback and merchant verification
```

**2. PayPal Connect Route** (`src/app/api/pro/paypal/connect/route.ts`) ❌
```typescript
// TODO: Create PayPal onboarding endpoint
// - Generate partner referral URL
// - Store PayPal merchant ID in professional_profiles
// - Handle return URL after onboarding complete
```

**3. PayPal Disconnect Route** (`src/app/api/pro/paypal/disconnect/route.ts`) ❌
```typescript
// TODO: Create PayPal disconnect endpoint
// - Remove PayPal merchant ID from professional_profiles
// - Set payment_processor to null
```

**4. PayPal Webhook Handler** (`src/app/api/webhooks/paypal/route.ts`) ❌
```typescript
// TODO: Handle PayPal IPN (Instant Payment Notification) webhooks
// - Payment received events (booking payments)
// - Payout events (professional earnings transfers)
// - Merchant verification status updates
// - Dispute/refund events
```

#### Database Schema Updates Needed:
```sql
-- TODO: Add PayPal-specific fields to professional_profiles
ALTER TABLE professional_profiles ADD COLUMN paypal_merchant_id text;
ALTER TABLE professional_profiles ADD COLUMN paypal_email text;
ALTER TABLE professional_profiles ADD COLUMN paypal_verified boolean DEFAULT false;

-- TODO: Update stripe_connect_id to payment_processor_id for multi-processor support
ALTER TABLE professional_profiles RENAME COLUMN stripe_connect_id TO payment_processor_id;
ALTER TABLE professional_profiles ADD COLUMN payment_processor text; -- 'stripe' or 'paypal'
```

---

### Phase 6: Internationalization (i18n) 🌍

**Translation Files:** `messages/en.json` and `messages/es.json`

#### Keys to Add:

```json
{
  "countries": {
    "CO": "Colombia",
    "PY": "Paraguay",
    "UY": "Uruguay",
    "AR": "Argentina"
  },
  "cities": {
    "asuncion": "Asunción",
    "ciudad-del-este": "Ciudad del Este",
    "encarnacion": "Encarnación",
    "montevideo": "Montevideo",
    "punta-del-este": "Punta del Este",
    "maldonado": "Maldonado",
    "buenos-aires": "Buenos Aires",
    "cordoba": "Córdoba",
    "rosario": "Rosario",
    "mendoza": "Mendoza"
  },
  "payment": {
    "processor": {
      "stripe": "Stripe",
      "paypal": "PayPal"
    },
    "connect": {
      "paypal_required": "PayPal is required for professionals in Paraguay",
      "stripe_required": "Stripe Connect is required for professionals in this country"
    }
  }
}
```

---

### Phase 7: Testing & Validation 🧪

#### Critical Tests Before Launch:

**Database Migration:**
- [ ] Test migration on fresh local Supabase instance
- [ ] Verify all reference tables created successfully
- [ ] Verify existing `pricing_controls` data migrated from "Colombia" to "CO"
- [ ] Test helper functions: `get_cities_by_country('PY')`, etc.
- [ ] Verify RLS policies allow public reads, admin-only writes

**Currency Formatting:**
- [ ] Test `formatCOP(50000)` → "$50.000" (0 decimals)
- [ ] Test `formatPYG(50000)` → "₲ 50.000" (0 decimals)
- [ ] Test `formatUYU(50.5)` → "$U 50,50" (2 decimals)
- [ ] Test `formatARS(50.5)` → "$50,50" (2 decimals)

**Professional Onboarding:**
- [ ] Test Colombia professional signup (Stripe Connect)
- [ ] Test Paraguay professional signup (PayPal Connect - once implemented)
- [ ] Test Uruguay/Argentina professional signup (Stripe Connect)
- [ ] Verify country/city cascading dropdowns work correctly

**Location Selection:**
- [ ] Test Match Wizard with country selector (CO → Bogotá → Chapinero)
- [ ] Test Match Wizard with new countries (AR → Buenos Aires → no neighborhoods yet)
- [ ] Test Brief Form with multi-country selection

**Payment Processing:**
- [ ] Test Stripe Connect account creation for CO/UY/AR professionals
- [ ] Test PayPal Connect account creation for PY professionals (once implemented)
- [ ] Test booking payment flow for each country's currency

**Search & Filtering:**
- [ ] Test professional search by city across multiple countries
- [ ] Test geographic radius search for new cities
- [ ] Verify search results show correct currency per country

---

## 📊 COMPLETION STATUS

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1: Database Foundation** | ✅ Complete | 100% |
| **Phase 2: Configuration & Constants** | ✅ Complete | 100% |
| **Phase 3: Application Updates** | ⏳ In Progress | 40% |
| **Phase 4: UI Component Updates** | ❌ Not Started | 0% |
| **Phase 5: PayPal Integration** | ❌ Not Started | 0% |
| **Phase 6: Internationalization** | ❌ Not Started | 0% |
| **Phase 7: Testing & Validation** | ❌ Not Started | 0% |
| **OVERALL PROGRESS** | ⏳ In Progress | **34%** |

---

## 🚨 CRITICAL BLOCKERS

### 1. **PayPal Integration Required for Paraguay** ⚠️
- **Issue:** Stripe Connect does NOT support Paraguay
- **Impact:** Professionals in Paraguay cannot receive payments without PayPal
- **Workaround:** Temporarily launch PY with PayPal onboarding disabled, allow manual payment setup
- **Long-term:** Implement full PayPal Partner Referrals API integration (Phase 5)

### 2. **Background Checks Availability** ⚠️
- **Issue:** Truora (current provider) may not operate in PY/UY/AR
- **Impact:** Cannot perform background verification for professionals in new countries
- **Research Needed:** Investigate alternative LATAM background check providers:
  - Checkr (has some LATAM coverage)
  - Local providers per country (e.g., Veritran in Argentina)
- **Workaround:** Launch with manual verification for new countries initially

### 3. **UI Components Need Country Selector** ⚠️
- **Issue:** All signup/onboarding forms still show Colombia-only cities
- **Impact:** Users in new countries cannot select their location
- **Fix:** Implement country → city → neighborhood cascading dropdowns (Phase 4)

---

## 📁 FILES MODIFIED

### Created (9 files):
1. ✅ `supabase/migrations/20251119170320_add_multi_country_support.sql`
2. ✅ `src/lib/shared/config/territories.ts`
3. ✅ `MULTI_COUNTRY_EXPANSION_PROGRESS.md` (this file)
4. ❌ `src/lib/integrations/paypal/client.ts` (pending)
5. ❌ `src/app/api/pro/paypal/connect/route.ts` (pending)
6. ❌ `src/app/api/pro/paypal/disconnect/route.ts` (pending)
7. ❌ `src/app/api/webhooks/paypal/route.ts` (pending)
8. ❌ `messages/en.json` (needs i18n updates)
9. ❌ `messages/es.json` (needs i18n updates)

### Modified (5 files):
1. ✅ `src/lib/format.ts` (added ARS, UYU, PYG currency support)
2. ✅ `src/types/pricing.ts` (removed hardcoded cities)
3. ✅ `src/app/[locale]/auth/sign-up/actions.ts` (dynamic country)
4. ✅ `src/lib/validations/booking.ts` (dynamic country)
5. ❌ `src/app/api/pro/stripe/connect/route.ts` (needs conditional logic)

### Needs Updates (6 files):
1. ❌ `src/components/match-wizard/steps/location-step.tsx`
2. ❌ `src/components/brief/brief-form.tsx`
3. ❌ `src/app/[locale]/dashboard/pro/onboarding/page.tsx`
4. ❌ `src/app/[locale]/dashboard/pro/onboarding/application-form.tsx`
5. ❌ `src/lib/background-checks/truoraClient.ts`
6. ❌ `src/app/api/pro/stripe/connect/route.ts`

---

## 🎯 NEXT STEPS (Priority Order)

### Immediate (Can Deploy Without):
1. **Run Database Migration** - Test locally with `supabase db push`
2. **Update UI Components** - Add country selectors to all forms (Phase 4)
3. **Update Stripe Connect Logic** - Add conditional country check
4. **i18n Updates** - Add translations for new cities/countries

### Before Launch (Required):
1. **PayPal Integration** - Implement Phase 5 (critical for Paraguay)
2. **Background Checks Research** - Find providers for PY/UY/AR
3. **Comprehensive Testing** - Run all Phase 7 test cases
4. **Seed Neighborhood Data** - Add neighborhoods for new cities (optional, can be added later)

### Post-Launch (Iterative):
1. **Monitor Payment Flows** - Track Stripe vs PayPal conversion rates
2. **Gather Feedback** - Collect user feedback from new countries
3. **Optimize Localization** - Add region-specific marketing copy
4. **Add Neighborhoods** - Seed neighborhood data for new cities based on usage patterns

---

## 💡 USAGE EXAMPLES

### Using the Territories Config:

```typescript
import {
  COUNTRIES,
  getCitiesByCountry,
  getCurrencyByCountry,
  usesPayPal,
} from "@/lib/shared/config/territories";

// Get cities for Paraguay
const paraguayCities = getCitiesByCountry("PY");
// → [{ value: "asuncion", label: "Asunción", countryCode: "PY" }, ...]

// Get currency for Argentina
const currency = getCurrencyByCountry("AR");
// → { code: "ARS", symbol: "$", decimals: 2, ... }

// Check payment processor
if (usesPayPal("PY")) {
  // Redirect to PayPal onboarding
} else {
  // Use Stripe Connect
}
```

### Formatting Currency by Country:

```typescript
import { formatCOP, formatARS, formatUYU, formatPYG } from "@/lib/format";

// Colombia (no decimals)
formatCOP(50000); // → "$50.000"

// Paraguay (no decimals)
formatPYG(50000); // → "₲ 50.000"

// Uruguay (2 decimals)
formatUYU(50.5); // → "$U 50,50"

// Argentina (2 decimals)
formatARS(50.5); // → "$50,50"
```

---

## 📞 SUPPORT & QUESTIONS

For questions about this implementation:
1. **Database Issues:** Check `supabase/migrations/20251119170320_add_multi_country_support.sql`
2. **Config Questions:** See `src/lib/shared/config/territories.ts` documentation
3. **Currency Formatting:** Reference `src/lib/format.ts` examples
4. **PayPal Integration:** Research PayPal Partner Referrals API docs

**Documentation References:**
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [PayPal Partner Referrals API](https://developer.paypal.com/docs/commerce-platform/onboarding/partner-referrals/)
- [Stripe Connect Country Support](https://stripe.com/global)

---

**End of Progress Report**
**Version:** 1.0
**Date:** 2025-11-19
**Author:** AI Assistant (Claude Code)
