import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-[#fbfaf9] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="font-semibold text-[#7d7566] text-sm uppercase tracking-[0.2em]">
          {t("badge")}
        </p>
        <h1 className="mt-6 font-semibold text-5xl text-[#211f1a] leading-tight sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-[#5d574b] text-xl leading-relaxed sm:text-2xl">
          {t("description")}
        </p>
      </Container>
    </section>
  );
}
