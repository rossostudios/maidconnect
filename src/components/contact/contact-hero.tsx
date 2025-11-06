import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="tagline text-[#7a6d62]">{t("badge")}</p>
        <h1 className="serif-display-lg mt-6 text-[#1A1614]">{t("title")}</h1>
        <p className="lead mt-6 text-[#1A1614]/70">{t("description")}</p>
      </Container>
    </section>
  );
}
