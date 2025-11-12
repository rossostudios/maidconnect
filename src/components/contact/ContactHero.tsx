import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="tagline text-[neutral-400]">{t("badge")}</p>
        <h1 className="serif-display-lg mt-6 text-[neutral-900]">{t("title")}</h1>
        <p className="lead mt-6 text-[neutral-900]/70">{t("description")}</p>
      </Container>
    </section>
  );
}
