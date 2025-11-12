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
        "relative mx-auto w-full overflow-visible rounded-xl bg-white shadow-2xl",
        className
      )}
      onSubmit={handleSearch}
    >
      <div className="grid grid-cols-1 gap-2 overflow-visible p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        {/* Location Input */}
        <div className="group relative flex flex-col items-start gap-1">
          <label className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
            {t("where")}
          </label>
          <Select onValueChange={setLocation} value={location}>
            <SelectTrigger className="w-full appearance-none border-0 bg-transparent p-0 text-base text-stone-900 shadow-none focus:outline-none focus:ring-0">
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

        {/* Date Input */}
        <div className="group relative z-20 flex flex-col items-start gap-1 border-stone-200 border-y py-3 md:border-y-0 md:border-l md:py-0 md:pl-4">
          <label className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
            {t("when")}
          </label>
          <BrandedDatePicker onChange={setDate} placeholder={t("selectDate")} value={date} />
        </div>

        {/* Service Type */}
        <div className="group relative flex flex-col items-start gap-1 border-stone-200 border-b pb-3 md:border-b-0 md:border-l md:pb-0 md:pl-4">
          <label className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
            {t("service")}
          </label>
          <Select onValueChange={setServiceType} value={serviceType}>
            <SelectTrigger className="w-full appearance-none border-0 bg-transparent p-0 text-base text-stone-900 shadow-none focus:outline-none focus:ring-0">
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

        {/* Search Button */}
        <Button
          className="h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-stone-900 font-bold text-base text-white uppercase tracking-wider transition-transform hover:scale-105 md:w-auto md:px-8"
          type="submit"
        >
          {t("searchButton")}
        </Button>
      </div>
    </form>
  );
}
