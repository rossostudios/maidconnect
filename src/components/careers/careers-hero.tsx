import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function CareersHero() {
  const t = await getTranslations("pages.careers.hero");

  return (
    <section className="bg-[var(--background)] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text Content */}
          <div>
            <p className="font-semibold text-[#7d7566] text-sm uppercase tracking-[0.2em]">
              {t("badge")}
            </p>
            <h1 className="type-serif-display mt-6 text-[var(--foreground)]">{t("title")}</h1>
            <p className="mt-6 text-[var(--muted-foreground)] text-xl leading-relaxed sm:text-2xl">
              {t("description")}
            </p>
            <div className="mt-12">
              <Button href="#positions" icon label={t("primaryCTA")} />
            </div>
          </div>

          {/* Right Column - Team Image */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-gradient-to-br from-[var(--red)]/10 to-[var(--red)]/5 shadow-[0_20px_60px_rgba(18,17,15,0.08)]">
              {/* Placeholder for team image */}
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-[#7d7566]">
                  <svg
                    aria-hidden="true"
                    className="mx-auto h-24 w-24 text-[var(--red)]/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                  </svg>
                  <p className="mt-4 text-sm">Team image placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
