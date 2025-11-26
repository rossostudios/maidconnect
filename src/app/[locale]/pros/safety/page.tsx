import { Alert01Icon, Briefcase01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

/**
 * Worker Safety & Protection Page
 *
 * Provides comprehensive information about worker rights, protections,
 * and safety policies for household professionals across all markets.
 *
 * Country-specific content includes:
 * - Minimum wage requirements
 * - Labor law compliance
 * - Local emergency contacts
 */
export default async function WorkerSafetyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pros.safety" });

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rausch-100">
              <CheckmarkCircle01Icon className="h-10 w-10 text-rausch-600" />
            </div>
          </div>
          <h1
            className={cn(
              "mb-4 font-semibold text-4xl text-neutral-900 tracking-tight sm:text-5xl",
              geistSans.className
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "mx-auto max-w-2xl text-lg text-neutral-600 leading-relaxed",
              geistSans.className
            )}
          >
            {t("description")}
          </p>
        </div>

        {/* Key Protections Overview */}
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-babu-100">
              <CheckmarkCircle01Icon className="h-6 w-6 text-babu-600" />
            </div>
            <h3 className="mb-2 font-semibold text-lg text-neutral-900">
              {t("overview.legal.title")}
            </h3>
            <p className="text-neutral-600 text-sm">{t("overview.legal.description")}</p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 font-semibold text-lg text-neutral-900">
              {t("overview.safety.title")}
            </h3>
            <p className="text-neutral-600 text-sm">{t("overview.safety.description")}</p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rausch-100">
              <Briefcase01Icon className="h-6 w-6 text-rausch-600" />
            </div>
            <h3 className="mb-2 font-semibold text-lg text-neutral-900">
              {t("overview.support.title")}
            </h3>
            <p className="text-neutral-600 text-sm">{t("overview.support.description")}</p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {/* Worker Rights */}
          <section className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 font-semibold text-2xl text-neutral-900">
              {t("workerRights.title")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg text-rausch-500">✓</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("workerRights.contracts.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("workerRights.contracts.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg text-rausch-500">✓</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("workerRights.minimumWage.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("workerRights.minimumWage.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg text-rausch-500">✓</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("workerRights.workingHours.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("workerRights.workingHours.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg text-rausch-500">✓</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("workerRights.benefits.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("workerRights.benefits.description")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Anti-Harassment Policy */}
          <section className="rounded-lg border border-rausch-200 bg-rausch-50 p-8">
            <div className="flex items-start gap-4">
              <Alert01Icon className="mt-1 h-6 w-6 flex-shrink-0 text-rausch-600" />
              <div>
                <h2 className="mb-3 font-semibold text-2xl text-rausch-900">
                  {t("antiHarassment.title")}
                </h2>
                <p className="mb-4 text-rausch-800">{t("antiHarassment.description")}</p>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-rausch-900">
                    {t("antiHarassment.zeroTolerance.title")}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-rausch-800 text-sm">
                      <span className="mt-1">•</span>
                      <span>{t("antiHarassment.zeroTolerance.verbal")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-rausch-800 text-sm">
                      <span className="mt-1">•</span>
                      <span>{t("antiHarassment.zeroTolerance.physical")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-rausch-800 text-sm">
                      <span className="mt-1">•</span>
                      <span>{t("antiHarassment.zeroTolerance.discrimination")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-rausch-800 text-sm">
                      <span className="mt-1">•</span>
                      <span>{t("antiHarassment.zeroTolerance.workEnvironment")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* How to Report Issues */}
          <section className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 font-semibold text-2xl text-neutral-900">{t("reporting.title")}</h2>
            <p className="mb-6 text-neutral-600">{t("reporting.description")}</p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">
                  {t("reporting.channels.title")}
                </h3>
                <div className="space-y-3">
                  <div className="border-neutral-200 border-l-4 border-l-rausch-500 bg-neutral-50 p-4">
                    <h4 className="font-semibold text-neutral-900">
                      {t("reporting.channels.casaoraSupport.title")}
                    </h4>
                    <p className="mt-1 text-neutral-600 text-sm">
                      {t("reporting.channels.casaoraSupport.description")}
                    </p>
                    <p className="mt-2 font-mono text-neutral-900 text-sm">support@casaora.co</p>
                  </div>

                  <div className="border-neutral-200 border-l-4 border-l-rausch-500 bg-neutral-50 p-4">
                    <h4 className="font-semibold text-neutral-900">
                      {t("reporting.channels.emergencyHotline.title")}
                    </h4>
                    <p className="mt-1 text-neutral-600 text-sm">
                      {t("reporting.channels.emergencyHotline.description")}
                    </p>
                    <p className="mt-2 font-mono text-neutral-900 text-sm">
                      {t("reporting.channels.emergencyHotline.number")}
                    </p>
                  </div>

                  <div className="border-neutral-200 border-l-4 border-l-rausch-500 bg-neutral-50 p-4">
                    <h4 className="font-semibold text-neutral-900">
                      {t("reporting.channels.localAuthorities.title")}
                    </h4>
                    <p className="mt-1 text-neutral-600 text-sm">
                      {t("reporting.channels.localAuthorities.description")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-babu-200 bg-babu-50 p-4">
                <h4 className="font-semibold text-babu-900">
                  {t("reporting.confidentiality.title")}
                </h4>
                <p className="mt-1 text-babu-800 text-sm">
                  {t("reporting.confidentiality.description")}
                </p>
              </div>
            </div>
          </section>

          {/* Legal Contracts & Documentation */}
          <section className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 font-semibold text-2xl text-neutral-900">
              {t("legalContracts.title")}
            </h2>
            <p className="mb-6 text-neutral-600">{t("legalContracts.description")}</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-babu-500 text-lg">📄</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("legalContracts.written.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("legalContracts.written.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-babu-500 text-lg">💰</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("legalContracts.payment.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("legalContracts.payment.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-babu-500 text-lg">🔒</span>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {t("legalContracts.termination.title")}
                  </h4>
                  <p className="mt-1 text-neutral-600 text-sm">
                    {t("legalContracts.termination.description")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Country-Specific Information */}
          <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
            <h2 className="mb-6 font-semibold text-2xl text-neutral-900">
              {t("countrySpecific.title")}
            </h2>
            <p className="mb-6 text-neutral-600">{t("countrySpecific.description")}</p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">
                  {t("countrySpecific.laborMinistry.title")}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t("countrySpecific.laborMinistry.description")}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">
                  {t("countrySpecific.minimumWageInfo.title")}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t("countrySpecific.minimumWageInfo.description")}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">
                  {t("countrySpecific.healthSafety.title")}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t("countrySpecific.healthSafety.description")}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">
                  {t("countrySpecific.emergencyContacts.title")}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t("countrySpecific.emergencyContacts.description")}
                </p>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="rounded-lg border border-green-200 bg-green-50 p-8">
            <h2 className="mb-4 font-semibold text-2xl text-green-900">{t("resources.title")}</h2>
            <p className="mb-6 text-green-800">{t("resources.description")}</p>

            <div className="space-y-3">
              <a
                className="block rounded-lg border border-green-200 bg-white px-6 py-4 font-medium text-green-900 transition hover:bg-green-50"
                href="/help/worker-rights"
              >
                {t("resources.links.workerRightsGuide")} →
              </a>
              <a
                className="block rounded-lg border border-green-200 bg-white px-6 py-4 font-medium text-green-900 transition hover:bg-green-50"
                href="/help/contracts"
              >
                {t("resources.links.contractTemplates")} →
              </a>
              <a
                className="block rounded-lg border border-green-200 bg-white px-6 py-4 font-medium text-green-900 transition hover:bg-green-50"
                href="/help/dispute-resolution"
              >
                {t("resources.links.disputeResolution")} →
              </a>
              <a
                className="block rounded-lg border border-green-200 bg-white px-6 py-4 font-medium text-green-900 transition hover:bg-green-50"
                href="/contact"
              >
                {t("resources.links.contactSupport")} →
              </a>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">{t("footer.title")}</h2>
          <p className="mb-6 text-neutral-600">{t("footer.description")}</p>
          <a
            className="inline-flex items-center justify-center rounded-lg bg-rausch-500 px-8 py-4 font-semibold text-white transition hover:bg-rausch-600"
            href="mailto:support@casaora.co"
          >
            {t("footer.cta")}
          </a>
        </div>
      </div>
    </div>
  );
}
