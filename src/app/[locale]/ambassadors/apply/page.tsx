import { Award01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AmbassadorApplicationForm } from "./ambassador-application-form";

export const metadata: Metadata = {
  title: "Apply to Become an Ambassador | Casaora",
  description:
    "Apply to join the Casaora Ambassador Program. Refer home service professionals and earn $15 for each successful referral.",
};

export default async function AmbassadorApplyPage() {
  const t = await getTranslations("ambassadors.apply");

  return (
    <div className="flex min-h-screen">
      {/* Left: Info Panel */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 lg:block">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
              <HugeiconsIcon className="h-4 w-4 text-white" icon={Award01Icon} />
              <span className="font-medium text-sm text-white">{t("hero.badge")}</span>
            </div>
            <h2 className="mb-4 font-bold text-3xl text-white">{t("hero.title")}</h2>
            <p className="mb-6 text-white/80">{t("hero.subtitle")}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>{t("hero.benefit1")}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>{t("hero.benefit2")}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>{t("hero.benefit3")}</span>
              </div>
            </div>

            {/* Reward highlight */}
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="mb-1 text-sm text-white/70">{t("hero.rewardLabel")}</p>
              <p className="font-bold text-3xl text-white">$15</p>
              <p className="text-sm text-white/70">{t("hero.rewardSubtext")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <header className="flex items-center justify-between border-neutral-200 border-b px-6 py-4 lg:px-12">
          <Link className="font-bold text-neutral-900 text-xl" href="/">
            Casaora
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              className="font-semibold text-orange-600 hover:text-orange-700"
              href="/ambassadors"
            >
              {t("learnMore")}
            </Link>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="mb-2 font-bold text-2xl text-neutral-900 sm:text-3xl">{t("title")}</h1>
              <p className="text-neutral-600">{t("subtitle")}</p>
            </div>

            <AmbassadorApplicationForm />

            <p className="mt-6 text-center text-neutral-600 text-xs">
              {t("terms.prefix")}{" "}
              <Link className="text-orange-600 hover:underline" href="/terms">
                {t("terms.termsLink")}
              </Link>{" "}
              {t("terms.and")}{" "}
              <Link className="text-orange-600 hover:underline" href="/privacy">
                {t("terms.privacyLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
