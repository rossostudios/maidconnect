"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrandedDatePicker } from "@/components/ui/branded-date-picker";
import { cn } from "@/lib/utils";

type HeroSearchBarProps = {
  className?: string;
};

export function HeroSearchBar({ className }: HeroSearchBarProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [serviceType, setServiceType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build search params
    const params = new URLSearchParams();
    if (location) {
      params.set("city", location);
    }
    if (date) {
      params.set("date", date);
    }
    if (serviceType) {
      params.set("service", serviceType);
    }

    // Navigate to professionals page with search params
    router.push(`/professionals?${params.toString()}`);
  };

  return (
    <form
      className={cn(
        "relative mx-auto max-w-7xl overflow-visible rounded-[32px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-sm",
        className
      )}
      onSubmit={handleSearch}
    >
      <div className="grid overflow-visible rounded-[32px] md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(280px,1.3fr)_auto]">
        {/* Location Input */}
        <div className="group relative flex items-center px-8 py-6">
          <div className="flex-1">
            <label
              className="block font-semibold text-stone-600 text-xs uppercase tracking-[0.2em]"
              htmlFor="location"
            >
              {t("where")}
            </label>
            <select
              className="mt-2 w-full border-none bg-transparent text-base text-stone-900 outline-none"
              id="location"
              onChange={(e) => setLocation(e.target.value)}
              value={location}
            >
              <option value="">{t("selectCity")}</option>
              <option value="bogota">{t("cities.bogota")}</option>
              <option value="medellin">{t("cities.medellin")}</option>
              <option value="cali">{t("cities.cali")}</option>
              <option value="barranquilla">{t("cities.barranquilla")}</option>
              <option value="cartagena">{t("cities.cartagena")}</option>
              <option value="bucaramanga">{t("cities.bucaramanga")}</option>
            </select>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-stone-200 md:block" />
        </div>

        {/* Date Input */}
        <div className="group relative z-20 flex items-center px-8 py-6">
          <div className="flex-1">
            <label className="block font-semibold text-stone-600 text-xs uppercase tracking-[0.2em]">
              {t("when")}
            </label>
            <div className="mt-2">
              <BrandedDatePicker onChange={setDate} placeholder={t("selectDate")} value={date} />
            </div>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-stone-200 md:block" />
        </div>

        {/* Service Type */}
        <div className="group relative flex items-center px-8 py-6">
          <div className="flex-1">
            <label
              className="block font-semibold text-stone-600 text-xs uppercase tracking-[0.2em]"
              htmlFor="service"
            >
              {t("service")}
            </label>
            <select
              className="mt-2 w-full border-none bg-transparent text-base text-stone-900 outline-none"
              id="service"
              onChange={(e) => setServiceType(e.target.value)}
              value={serviceType}
            >
              <option value="">{t("anyService")}</option>
              <option value="cleaning">{t("services.cleaning")}</option>
              <option value="cooking">{t("services.cooking")}</option>
              <option value="childcare">{t("services.childcare")}</option>
              <option value="elderly">{t("services.elderly")}</option>
              <option value="gardening">{t("services.gardening")}</option>
              <option value="pet">{t("services.pet")}</option>
            </select>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-stone-200 md:block" />
        </div>

        {/* Search Button */}
        <button
          className="flex items-center justify-center rounded-r-[32px] bg-orange-500 px-12 py-6 font-semibold text-sm text-white uppercase tracking-[0.15em] transition-all hover:bg-orange-600 active:scale-[0.98] md:min-w-[180px]"
          type="submit"
        >
          {t("searchButton")}
        </button>
      </div>
    </form>
  );
}
