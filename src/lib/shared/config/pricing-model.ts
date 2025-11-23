import type { Currency, Locale } from "@/lib/utils/format";

export type ServiceLevelKey = "instantBook";

export const PRICING_MODEL: Record<
  ServiceLevelKey,
  { customerFee: number; professionalFee: number }
> = {
  instantBook: { customerFee: 0.15, professionalFee: 0 },
};

type CurrencyMeta = { label: string; rateFromCOP: number; locale: Locale };

// Indicative FX rates for display only (do not use for billing)
export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  COP: { label: "COP", rateFromCOP: 1, locale: "es-CO" },
  USD: { label: "USD", rateFromCOP: 1 / 4000, locale: "en-US" },
  ARS: { label: "ARS", rateFromCOP: 0.225, locale: "es-AR" }, // ~900 ARS per USD at 4000 COP/USD
  UYU: { label: "UYU", rateFromCOP: 0.01, locale: "es-UY" }, // ~40 UYU per USD at 4000 COP/USD
  PYG: { label: "PYG", rateFromCOP: 1.82, locale: "es-PY" }, // ~7300 PYG per USD at 4000 COP/USD
};

export const SUPPORTED_PRICING_CURRENCIES = Object.keys(CURRENCY_META) as Currency[];
