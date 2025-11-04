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
    <section className="py-20 sm:py-24 lg:py-28" id="services">
      <Container>
        <div className="mx-auto max-w-6xl space-y-16 text-center">
          <div className="space-y-5">
            <p className="tagline">{t("badge")}</p>
            <h2 className="type-serif-lg mx-auto max-w-3xl text-[var(--foreground)]">
              {t("title")}
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => (
              <div
                className="group hover:-translate-y-1 flex h-full flex-col items-start rounded-[28px] border border-[var(--border)] bg-white p-8 text-left shadow-[0_10px_40px_rgba(15,15,15,0.04)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,15,15,0.12)] hover:backdrop-blur-sm"
                key={key}
              >
                <h3 className="type-serif-sm text-[var(--foreground)]">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-3 text-[var(--muted-foreground)] text-base">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
