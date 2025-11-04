import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function CareersPositions() {
  const t = await getTranslations("pages.careers.positions");

  // Get all categories
  const categories = ["engineering", "product", "customerSuccess"] as const;

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32" id="positions">
      <Container className="max-w-5xl">
        <h2 className="type-serif-lg text-[var(--foreground)]">{t("title")}</h2>

        <div className="mt-16 space-y-16">
          {categories.map((categoryKey) => {
            const categoryTitle = t(`categories.${categoryKey}.title`);

            // Get job keys for this category
            const getJobKeys = () => {
              if (categoryKey === "engineering") {
                return ["fullstack", "frontend"];
              }
              if (categoryKey === "product") {
                return ["designer"];
              }
              return ["csManager"];
            };
            const jobKeys = getJobKeys();

            return (
              <div key={categoryKey}>
                {/* Category Title */}
                <h3 className="mb-6 font-semibold text-2xl text-[var(--foreground)]">
                  {categoryTitle}
                </h3>

                {/* Job Listings */}
                <div className="space-y-4">
                  {jobKeys.map((jobKey) => {
                    const jobTitle = t(`categories.${categoryKey}.jobs.${jobKey}.title`);
                    const jobLocation = t(`categories.${categoryKey}.jobs.${jobKey}.location`);
                    const jobSalary = t(`categories.${categoryKey}.jobs.${jobKey}.salary`);

                    return (
                      <div
                        className="flex flex-col gap-4 rounded-[20px] border border-[#ebe5d8] bg-white p-6 transition hover:border-[#dcd6c7] hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)] sm:flex-row sm:items-center sm:justify-between"
                        key={jobKey}
                      >
                        {/* Job Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--foreground)] text-xl">
                            {jobTitle}
                          </h4>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[#7d7566] text-sm">
                            <span className="flex items-center gap-1.5">
                              <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                                <path
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              {jobLocation}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              {jobSalary}
                            </span>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <Button
                          href={`mailto:careers@casaora.co?subject=Application: ${jobTitle}`}
                          label={t("applyButton")}
                          variant="primary"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* No perfect match CTA */}
        <div className="mt-16 rounded-[28px] bg-[var(--background)] p-8 text-center sm:p-12">
          <h3 className="font-semibold text-2xl text-[var(--foreground)] sm:text-3xl">
            Don't see a perfect match?
          </h3>
          <p className="mt-4 text-[var(--muted-foreground)] text-lg leading-relaxed">
            We're always looking for talented people. Send us your resume and let us know what
            you're passionate about.
          </p>
          <div className="mt-8">
            <Button
              href="mailto:careers@casaora.co?subject=General Application"
              icon
              label="Get in Touch"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
