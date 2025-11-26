import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-neutral-50 py-20 sm:py-24 lg:py-32 dark:bg-rausch-900">
      <Container className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-rausch-300">{t("badge")}</p>
        <h1 className="mt-6 font-bold text-4xl text-neutral-900 tracking-tight sm:text-5xl lg:text-6xl dark:text-white">{t("title")}</h1>
        <p className="mt-6 text-lg text-neutral-600 leading-relaxed sm:text-xl dark:text-rausch-200">{t("description")}</p>
      </Container>
    </section>
  );
}
