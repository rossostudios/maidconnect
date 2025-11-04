import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-[var(--background)] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="font-semibold text-[#7d7566] text-sm uppercase tracking-[0.2em]">
          {t("badge")}
        </p>
        <h1 className="type-serif-display mt-6 text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-6 text-[var(--muted-foreground)] text-xl leading-relaxed sm:text-2xl">
          {t("description")}
        </p>
      </Container>
    </section>
  );
}
