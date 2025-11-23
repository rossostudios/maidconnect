import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProSignUpForm } from "./pro-signup-form";

export const metadata: Metadata = {
  title: "Sign Up as a Professional | Casaora",
  description:
    "Create your Casaora professional account and start earning. Join thousands of verified home service professionals.",
};

export default async function ProSignUpPage() {
  const t = await getTranslations("becomeAPro.signup");

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          alt="Professional at work"
          className="object-cover"
          fill
          priority
          src="/images/auth/pro-signup-hero.jpg"
        />
        {/* Overlay with content */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-neutral-900/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <h2 className="mb-4 font-bold text-3xl text-white">{t("hero.title")}</h2>
            <p className="mb-6 text-white/80">{t("hero.subtitle")}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-400"
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
                  className="h-5 w-5 text-green-400"
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
                  className="h-5 w-5 text-green-400"
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
            <span className="text-neutral-600">{t("alreadyHaveAccount")}</span>
            <Link
              className="font-semibold text-orange-600 hover:text-orange-700"
              href="/auth/sign-in"
            >
              {t("signIn")}
            </Link>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="mb-2 font-bold text-2xl text-neutral-900 sm:text-3xl">{t("title")}</h1>
              <p className="text-neutral-600">{t("subtitle")}</p>
            </div>

            <ProSignUpForm />

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
