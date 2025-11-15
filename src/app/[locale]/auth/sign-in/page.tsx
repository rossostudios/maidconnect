import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.signIn.meta" });

  return {
    title: t("title"),
  };
}

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.signIn" });
  const searchParamsResolved = await searchParams;
  const redirectTo =
    typeof searchParamsResolved.redirectTo === "string" ? searchParamsResolved.redirectTo : null;
  const signedOut = searchParamsResolved.signedOut === "true";

  return (
    <div className="grid min-h-screen grid-cols-1 bg-neutral-50 md:h-screen md:grid-cols-[45%_55%] md:overflow-hidden">
      <div className="flex h-full flex-col border-neutral-200 border-r bg-neutral-50 px-8 py-10 md:h-screen md:overflow-y-auto md:px-16 md:py-16">
        <header className="flex items-center justify-between border-neutral-200 border-b pb-6 text-neutral-900 text-sm md:pb-10">
          <Link
            className="font-semibold text-neutral-900 transition hover:text-orange-500"
            href="/"
          >
            Casaora
          </Link>
          <Link
            className="font-semibold text-orange-500 transition hover:text-orange-500"
            href={AUTH_ROUTES.signUp}
          >
            {t("header.createAccount")}
          </Link>
        </header>
        <main className="flex flex-1 justify-center pt-12 pb-16 md:pt-14">
          <div className="w-full max-w-3xl space-y-12">
            <div className="space-y-5">
              <h1 className="serif-headline-lg text-neutral-900">{t("hero.title")}</h1>
              <p className="text-base text-neutral-900/70 leading-relaxed">
                {t("hero.description")}
              </p>
            </div>
            {signedOut && (
              <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-orange-500">
                    <svg
                      aria-label="Success"
                      className="h-5 w-5 text-white"
                      fill="none"
                      role="img"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Success</title>
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-orange-500 text-sm">Successfully signed out</p>
                    <p className="mt-0.5 text-orange-500 text-xs opacity-80">
                      Sign in again to access your account
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="border border-neutral-200 bg-neutral-50 p-12 shadow-[0_24px_60px_rgba(22,22,22,0.06)]">
              <SignInForm redirectTo={redirectTo} />
              <p className="mt-8 text-neutral-900/70 text-sm">
                {t("form.needAccount")}{" "}
                <Link
                  className="font-semibold text-orange-500 transition hover:text-orange-600"
                  href={AUTH_ROUTES.signUp}
                >
                  {t("form.createOneNow")}
                </Link>
              </p>
            </div>
          </div>
        </main>
        <p className="mt-10 text-neutral-500 text-xs">{t("footer.support")}</p>
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-0 h-screen">
          <div className="relative h-full">
            <Image
              alt={t("sidebar.imageAlt")}
              className="object-cover"
              fill
              priority
              src="/login.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,16,14,0.75),rgba(33,31,26,0.35))]" />
            <div className="absolute inset-x-14 bottom-14 max-w-md space-y-3 text-white">
              <p className="font-semibold text-neutral-500 text-xs uppercase tracking-[0.3em]">
                {t("sidebar.badge")}
              </p>
              <h2 className="font-semibold text-2xl leading-snug">{t("sidebar.title")}</h2>
              <p className="text-[bg-neutral-50] text-sm">{t("sidebar.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
