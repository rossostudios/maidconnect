-- =====================================================
-- Migration: Create currencies reference table
-- Purpose: Multi-country data model Phase 2.3 - Currency configuration
-- =====================================================
-- This migration creates a currencies table with metadata for all supported currencies.
-- Includes formatting rules, exchange rates, and payment processor configuration.

-- =====================================================
-- Part 1: Create currencies table
-- =====================================================

CREATE TABLE IF NOT EXISTS currencies (
  code text PRIMARY KEY,  -- ISO 4217 code
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places smallint NOT NULL DEFAULT 2,
  minor_unit_name text NOT NULL,  -- e.g., "cents", "centavos"
  country_code text NOT NULL REFERENCES countries(code),

  -- Exchange rates (relative to USD)
  usd_exchange_rate numeric(12, 6) NOT NULL,
  last_rate_update timestamptz DEFAULT now(),

  -- Formatting
  symbol_position text NOT NULL CHECK (symbol_position IN ('before', 'after')),
  thousands_separator text NOT NULL DEFAULT ',',
  decimal_separator text NOT NULL DEFAULT '.',

  -- Payment processor support
  stripe_supported boolean NOT NULL DEFAULT false,
  paypal_supported boolean NOT NULL DEFAULT false,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- Part 2: Insert currency data
-- =====================================================

INSERT INTO currencies (
  code, name, symbol, decimal_places, minor_unit_name, country_code,
  usd_exchange_rate, symbol_position, thousands_separator, decimal_separator,
  stripe_supported, paypal_supported
) VALUES
  -- Colombia
  ('COP', 'Colombian Peso', '$', 0, 'centavos', 'CO',
   4200.00,  -- ~4,200 COP = 1 USD (approximate, update regularly)
   'before', '.', ',',
   true, true),  -- Stripe & PayPal both support COP

  -- Paraguay
  ('PYG', 'Paraguayan Guaraní', '₲', 0, 'céntimos', 'PY',
   7300.00,  -- ~7,300 PYG = 1 USD (approximate)
   'before', '.', ',',
   false, true),  -- Only PayPal supports PYG (Stripe doesn't)

  -- Uruguay
  ('UYU', 'Uruguayan Peso', '$U', 2, 'centésimos', 'UY',
   39.50,  -- ~39.50 UYU = 1 USD (approximate)
   'before', '.', ',',
   false, true),  -- Only PayPal supports UYU (Stripe doesn't)

  -- Argentina
  ('ARS', 'Argentine Peso', '$', 2, 'centavos', 'AR',
   950.00,  -- ~950 ARS = 1 USD (approximate, highly volatile)
   'before', '.', ',',
   false, true),  -- Only PayPal supports ARS (Stripe doesn't)

  -- USD (for reference and potential US customers)
  ('USD', 'US Dollar', '$', 2, 'cents', 'CO',  -- Reference country
   1.00,  -- 1 USD = 1 USD
   'before', ',', '.',
   true, true);

-- =====================================================
-- Part 3: Create indexes
-- =====================================================

CREATE INDEX idx_currencies_country_code ON currencies(country_code);
CREATE INDEX idx_currencies_stripe_supported ON currencies(stripe_supported);
CREATE INDEX idx_currencies_paypal_supported ON currencies(paypal_supported);

-- =====================================================
-- Part 4: Add constraints
-- =====================================================

-- Ensure decimal_places is valid
ALTER TABLE currencies
  ADD CONSTRAINT currencies_decimal_places_check
    CHECK (decimal_places >= 0 AND decimal_places <= 4);

-- Ensure exchange rate is positive
ALTER TABLE currencies
  ADD CONSTRAINT currencies_usd_exchange_rate_check
    CHECK (usd_exchange_rate > 0);

-- =====================================================
-- Part 5: Create function to update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION private.currencies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER currencies_updated_at_trigger
  BEFORE UPDATE ON currencies
  FOR EACH ROW
  EXECUTE FUNCTION private.currencies_updated_at();

-- =====================================================
-- Part 6: Add comments
-- =====================================================

COMMENT ON TABLE currencies IS
  'Currency reference data for multi-country operations. Includes exchange rates, formatting rules, and payment processor support.';

COMMENT ON COLUMN currencies.code IS
  'ISO 4217 currency code (COP, PYG, UYU, ARS, USD).';

COMMENT ON COLUMN currencies.decimal_places IS
  'Number of decimal places for display. 0 for COP/PYG (no decimal), 2 for UYU/ARS/USD.';

COMMENT ON COLUMN currencies.minor_unit_name IS
  'Name of minor currency unit (centavos, céntimos, cents).';

COMMENT ON COLUMN currencies.usd_exchange_rate IS
  'Exchange rate relative to USD (how many units of this currency = 1 USD). Example: 4200 COP = 1 USD. Update regularly for accuracy.';

COMMENT ON COLUMN currencies.stripe_supported IS
  'Whether Stripe payment processor supports this currency. COP: Yes, PYG/UYU/ARS: No (as of 2025-01).';

COMMENT ON COLUMN currencies.paypal_supported IS
  'Whether PayPal supports this currency. All LA currencies supported: COP, PYG, UYU, ARS.';

-- =====================================================
-- Part 7: Currency-specific notes
-- =====================================================

COMMENT ON COLUMN currencies.symbol_position IS
  'Currency symbol position: "before" ($100) or "after" (100$). All LA currencies use "before".';

COMMENT ON COLUMN currencies.thousands_separator IS
  'Thousands separator character. Colombia: "." (1.000.000), Others: "," (1,000,000).';

COMMENT ON COLUMN currencies.decimal_separator IS
  'Decimal separator character. Colombia: "," (1.000,50), Others: "." (1,000.50).

   IMPORTANT NOTES:
   - COP & PYG: No decimals in practice (decimal_places = 0)
   - UYU, ARS, USD: 2 decimal places
   - Colombian formatting: $1.000.000,50 (dots for thousands, comma for decimals)
   - Other LA: $1,000,000.50 (comma for thousands, dot for decimals)';
