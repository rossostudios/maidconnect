import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ServicesSection() {
  const t = await getTranslations("services");

  const serviceKeys = [
    "housekeeping",
    "childcare",
    "relocation",
    "elderCare",
    "petCare",
    "lifestyle",
  ] as const;

  return (
    <section className="py-16 sm:py-20 lg:py-24" id="services">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="font-semibold text-[#a49c90] text-sm uppercase tracking-[0.32em]">
              {t("badge")}
            </p>
            <h2 className="mx-auto max-w-3xl font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => (
              <div
                className="group hover:-translate-y-1 flex h-full flex-col items-start rounded-[28px] border border-[#e5dfd4] bg-white p-8 text-left shadow-[0_10px_40px_rgba(15,15,15,0.04)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,15,15,0.12)] hover:backdrop-blur-sm"
                key={key}
              >
                <h3 className="font-semibold text-2xl text-[#211f1a]">{t(`items.${key}.title`)}</h3>
                <p className="mt-3 text-[#5d574b] text-base">{t(`items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
