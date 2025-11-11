"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker as BrandedDatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type HeroSearchBarProps = {
  className?: string;
};

export function HeroSearchBar({ className }: HeroSearchBarProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [serviceType, setServiceType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build search params
    const params = new URLSearchParams();
    if (location) {
      params.set("city", location);
    }
    if (date) {
      params.set("date", date.toISOString().split("T")[0] || "");
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
        "relative mx-auto max-w-7xl overflow-visible rounded-[32px] bg-slate-50 shadow-[0_20px_70px_rgba(22,22,22,0.3)] backdrop-blur-sm",
        className
      )}
      onSubmit={handleSearch}
    >
      <div className="grid overflow-visible rounded-[32px] md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(280px,1.3fr)_auto]">
        {/* Location Input */}
        <div className="group relative flex items-center px-8 py-6">
          <div className="flex-1">
            <label className="block font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]">
              {t("where")}
            </label>
            <div className="mt-2">
              <Select onValueChange={setLocation} value={location}>
                <SelectTrigger className="border-none bg-transparent shadow-none ring-0 focus:ring-0">
                  <SelectValue placeholder={t("selectCity")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bogota">{t("cities.bogota")}</SelectItem>
                  <SelectItem value="medellin">{t("cities.medellin")}</SelectItem>
                  <SelectItem value="cali">{t("cities.cali")}</SelectItem>
                  <SelectItem value="barranquilla">{t("cities.barranquilla")}</SelectItem>
                  <SelectItem value="cartagena">{t("cities.cartagena")}</SelectItem>
                  <SelectItem value="bucaramanga">{t("cities.bucaramanga")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-slate-200 md:block" />
        </div>

        {/* Date Input */}
        <div className="group relative z-20 flex items-center px-8 py-6">
          <div className="flex-1">
            <label className="block font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]">
              {t("when")}
            </label>
            <div className="mt-2">
              <BrandedDatePicker onChange={setDate} placeholder={t("selectDate")} value={date} />
            </div>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-slate-200 md:block" />
        </div>

        {/* Service Type */}
        <div className="group relative flex items-center px-8 py-6">
          <div className="flex-1">
            <label className="block font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]">
              {t("service")}
            </label>
            <div className="mt-2">
              <Select onValueChange={setServiceType} value={serviceType}>
                <SelectTrigger className="border-none bg-transparent shadow-none ring-0 focus:ring-0">
                  <SelectValue placeholder={t("anyService")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">{t("services.cleaning")}</SelectItem>
                  <SelectItem value="cooking">{t("services.cooking")}</SelectItem>
                  <SelectItem value="childcare">{t("services.childcare")}</SelectItem>
                  <SelectItem value="elderly">{t("services.elderly")}</SelectItem>
                  <SelectItem value="gardening">{t("services.gardening")}</SelectItem>
                  <SelectItem value="pet">{t("services.pet")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <span className="-translate-y-1/2 absolute top-1/2 right-0 hidden h-12 w-px bg-slate-200 md:block" />
        </div>

        {/* Search Button */}
        <Button
          className="rounded-r-[32px] bg-slate-500 px-12 py-6 font-semibold text-slate-50 text-sm uppercase tracking-[0.15em] hover:bg-slate-500 active:scale-[0.98] md:min-w-[180px]"
          type="submit"
        >
          {t("searchButton")}
        </Button>
      </div>
    </form>
  );
}
