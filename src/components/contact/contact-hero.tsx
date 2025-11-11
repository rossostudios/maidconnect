import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ContactHero() {
  const t = await getTranslations("pages.contact.hero");

  return (
    <section className="bg-[#f8fafc] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="tagline text-[#94a3b8]">{t("badge")}</p>
        <h1 className="serif-display-lg mt-6 text-[#0f172a]">{t("title")}</h1>
        <p className="lead mt-6 text-[#0f172a]/70">{t("description")}</p>
      </Container>
    </section>
  );
}
